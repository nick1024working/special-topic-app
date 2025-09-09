import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { map, Observable, tap, catchError, of, from, first, concatMap } from 'rxjs';
import { environment } from 'environments/environment';
import {
    FundProject, FundCategory,
    ProjectListDto, ProjectDetailDto,
    CategoryDto, PlanDto, FundPlan, CreateOrderDto, CreateOrderRes, PlanCreateInput, CreateFundOrderReq
} from './models';
import { AuthService } from 'app/shared/auth/auth.service';

const API = (environment.apiBaseUrl ?? '').trim();
const url1 = `${API}/api/projects`;
const url2 = `${API}/api/fund/projects`;
const url3 = `${API}/api/fund/FundProjects`;
const planUrlFundPlans = (pid: number) => `${API}/api/fund/FundPlans/byProject/${pid}`;
const planUrlFallback1 = (pid: number) => `${API}/api/fund/projects/${pid}/plans`;
const planUrlFallback2 = (pid: number) => `${API}/api/projects/${pid}/plans`;
const planUrlFallback3 = (pid: number) => `${API}/api/fund/DonatePlans/byProject/${pid}`;


@Injectable({ providedIn: 'root' })
export class FundService {
    constructor(private http: HttpClient, private auth: AuthService) { }
    private readonly API = (environment.apiBaseUrl ?? '').trim();
    private readonly baseUrl = this.API ? `${this.API}/api/fund` : '/api/fund';
    private readonly apiBase = environment.apiBaseUrl;

    private readonly apiBaseUrl: string =
        (environment as any).apiBaseUrl ||
        (environment as any).api ||
        '';

    private get API_ROOT() {
        return this.API.endsWith('/api') ? this.API : `${this.API}/api`;
    }

    /** 預設圖（專案與方案無圖時使用） */
    private readonly fallbackImg = 'assets/images/default.png';

    // -------- Projects --------

    fixPath = (p?: string | null) =>
        !p ? undefined : (p.startsWith('http') || p.startsWith('/')) ? p : `${API}/${p}`;

    // private readonly API = (environment as any).apiBaseUrl ?? (environment as any).api ?? '';

    /** 取全部專案（簡化：拉一頁大筆數即可） */
    getProjects(options: {
        status?: string; categoryId?: number; keyword?: string;
        page?: number; pageSize?: number;
    } = { page: 1, pageSize: 24 }): Observable<FundProject[]> {
        let params = new HttpParams();
        Object.entries(options).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
        });

        //匿名 GET 不帶 cookie
        return this.http.get<any>(`${API}/api/fund/FundProjects`, {
            params,
            withCredentials: false
        }).pipe(
            tap(res => console.log('[projects raw]', res)),
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.items ?? []);
                return items.map(this.toFundProjectFromList);
            })
        );
    }

    /** 取單筆詳情 */
    getProject(id: number) {
        // 先打 /api/projects → /api/fund/projects → /api/fund/FundProjects（都匿名）
        return this.http.get<ProjectDetailDto>(`${url1}/${id}`, { withCredentials: false }).pipe(
            catchError(_ => this.http.get<ProjectDetailDto>(`${url2}/${id}`, { withCredentials: false })),
            catchError(_ => this.http.get<ProjectDetailDto>(`${url3}/${id}`, { withCredentials: false })), // ← 移除原本的 this.authHeaders()
            // 三條都失敗 → 回退用列表找到那筆
            catchError(err =>
                this.getProjects({ page: 1, pageSize: 999 }).pipe(
                    map(list => {
                        const found = list.find(x => x.id === id);
                        if (!found) throw err;
                        return found;
                    })
                )
            ),
            map((dtoOrFund: ProjectDetailDto | FundProject) =>
                (dtoOrFund as any).donateProjectId !== undefined
                    ? this.toFundProjectFromDetail(dtoOrFund as ProjectDetailDto)
                    : (dtoOrFund as FundProject)
            )
        );
    }

    /** 依募資人數取前 N 名（前端排序） */
    getTopByBackers(n = 5): Observable<FundProject[]> {
        return this.getProjects({ page: 1, pageSize: 200 })
            .pipe(map(list => [...list].sort((a, b) => b.backerCount - a.backerCount).slice(0, n)));
    }

    // -------- Categories --------

    getCategories(): Observable<FundCategory[]> {
        return this.http.get<CategoryDto[]>(
            `${API}/api/fund/categories/all`,
            { withCredentials: false }
        ).pipe(map(arr => arr.map(this.toFundCategory)));
    }

    // -------- mapping --------

    /** 將相對路徑補成完整 URL；空值回傳預設圖 */
    public imageUrl(rel?: string | null): string {
        return this.img(rel);
    }

    /** 把相對路徑轉為完整網址；若已是 http(s) 則原樣回傳；空值回傳預設圖 */
    img(path?: string | null): string {
        if (!path || !String(path).trim()) return this.fallbackImg;
        const p = String(path);
        if (/^https?:\/\//i.test(p)) return p;
        const base = this.apiBaseUrl.replace(/\/+$/, '');
        const rel = p.replace(/^\/+/, '');
        return `${base}/${rel}`;
    }

    // 將 PlanDto 轉成前端使用的 FundPlan（在這一步把圖片補成完整 URL）
    private toFundPlan = (x: PlanDto): FundPlan => ({
        id: x.donatePlanId,
        projectId: x.donateProjectId,
        title: x.planTitle,
        price: x.price,
        description: x.planDescription ?? '',
        imagePath: this.img(x.planImagePath),
    });

    private toFundProjectFromList = (x: ProjectListDto): FundProject => ({
        id: x.donateProjectId,
        projectTitle: x.projectTitle,
        projectDescription: x.projectDescription ?? undefined,
        projectLongDescription: undefined,
        currentAmount: x.currentAmount,
        targetAmount: x.targetAmount,
        startDate: x.startDate,
        endDate: x.endDate,
        backerCount: x.backerCount,
        status: (x.status as any) ?? '募資中',
        mainImagePath: this.fixPath(x.mainImagePath),
        gallery: undefined,
        isFavorite: x.isFavorite,
        createdAt: (x as any).createdAt ?? (x as any).CreatedAt ?? null
    });

    private toFundProjectFromDetail = (x: any): FundProject => ({
        id: x.id ?? x.donateProjectId ?? x.projectId,
        projectTitle: x.projectTitle ?? x.title ?? '',

        // 短描述
        projectDescription:
            x.projectDescription ??
            x.projectShortDescription ??
            x.shortDescription ??
            x.projectDiscription ??
            x.projectShortDiscription ??
            '',

        // ★ 長描述（包含 Discription 的常見錯字與 snake_case）
        projectLongDescription:
            x.projectLongDescription ??
            x.longDescription ??
            x.project_long_description ??
            x.projectLongDiscription ??        // 你專案常見的拼法
            x.project_long_discription ??      // snake_case + typo
            x.content ??                       // 若你後端用 content
            x.descriptionLong ??               // 其他變形
            null,

        targetAmount: x.target_amount ?? x.targetAmount ?? 0,
        currentAmount: x.current_amount ?? x.currentAmount ?? 0,
        startDate: x.start_date ?? x.startDate ?? null,
        endDate: x.end_date ?? x.endDate ?? null,
        status: x.status ?? '',
        backerCount: x.backerCount ?? x.backer_count ?? 0,
        mainImagePath: this.fixPath(x.mainImagePath),
        donateCategoriesId: x.donateCategories_id ?? x.categoryId ?? null,
        createdAt: x.createdAt ?? x.CreatedAt ?? x.created_at ?? null
    });

    private toFundCategory = (c: CategoryDto): FundCategory => ({
        id: c.donateCategoriesId,
        name: c.categoriesName
    });

    createProject(dto: {
        donateCategoriesId: number;
        projectTitle: string;
        projectDescription: string | null;
        projectLongDescription?: string | null;
        targetAmount: number;
        startDate: string; // ISO
        endDate: string;   // ISO
        plans: Array<{ title: string; price: number; description: string | null }>;
    }): Observable<any> {
        // 相容後端常見鍵名
        const payload: any = {
            ...dto,
            title: dto.projectTitle,
            description: dto.projectDescription,
            longDescription: dto.projectLongDescription,
            plans: (dto.plans ?? []).map(p => ({
                planTitle: p.title,
                price: p.price,
                planDescription: p.description ?? null,
            })),
        };

        return this.http.post(`${this.baseUrl}/FundProjects`, payload, {
            withCredentials: true,
        });
    }

    uploadImage(projectId: number, file: File, isMain = true) {
        const fd = new FormData();
        fd.append('file', file);
        return this.http.post<any>(
            `${this.baseUrl}/projects/${projectId}/images/upload?isMain=${isMain}`,
            fd,
            { withCredentials: true }
        );
    }

    /** 取得某專案的所有方案（多路徑備援） */
    getPlans(projectId: number) {
        return this.http.get<PlanDto[]>(planUrlFundPlans(projectId)).pipe(
            // 若主路徑不存在，再逐一退回其它舊別名
            catchError(_ => this.http.get<PlanDto[]>(planUrlFallback1(projectId))),
            catchError(_ => this.http.get<PlanDto[]>(planUrlFallback2(projectId))),
            catchError(_ => this.http.get<PlanDto[]>(planUrlFallback3(projectId))),
            tap(res => console.log('[plans raw]', res)),   // 觀察回傳內容
            map(arr => (arr ?? []).map(this.toFundPlan))
        );
    }

    uploadPlanImage(planId: number, file: File): Observable<any> {
        const form = new FormData();
        form.append('file', file); // <-- 後端 FundPlansController 參數名是 file
        return this.http.post<any>(`${API}/api/fund/FundPlans/${planId}/image`, form, {
            withCredentials: true
        });
    }

    createPlan(input: PlanCreateInput): Observable<any> {
        return this.http.post(`${this.baseUrl}/FundPlans`, input, {
            withCredentials: true,
        });
    }

    createPlansBulk(inputs: PlanCreateInput[]) {
        return this.http.post<any>(`${this.baseUrl}/FundPlans/bulk`, inputs, {
            withCredentials: true,
        });
    }

    getPlansByProject(projectId: number) {
        return this.http.get<FundPlan[]>(
            `${API}/api/fund/FundPlans/byProject/${projectId}`,
            { withCredentials: false }
        );
    }

    getProjectById(id: number) {
        return this.getProject(id);
    }


    createOrder(dto: CreateOrderDto): Observable<CreateOrderRes> {
        return this.http.post<CreateOrderRes>(`${this.baseUrl}/FundOrders`, dto, {
            withCredentials: true,
        });
    }

    uploadProjectCover(projectId: number, file: File, isMain = true) {
        const fd = new FormData();
        fd.append('file', file); // ← 後端參數名也是 file
        return this.http.post<any>(
            `${this.baseUrl}/FundProjects/${projectId}/images?isMain=${isMain}`,
            fd,
            { withCredentials: true }
        );
    }

    private buildUrl(path: string): string {
        // 用 URL 物件組合，避免 //api 或漏斜線
        const u = new URL(path.replace(/^\/+/, ''), this.apiBase.endsWith('/') ? this.apiBase : this.apiBase + '/');
        return u.toString();
    }

    createFundOrder(req: CreateFundOrderReq) {
        const url = this.buildUrl('/api/fund/FundOrders'); // ← 精準對齊後端路由
        console.log('[FundService] POST', url, req);
        return this.http.post<{ url?: string; orderId?: number }>(url, req, { withCredentials: true });
    }

    requestFundLinePay(orderId: number | string)
        : Observable<{ returnCode: string; returnMessage: string; info: { orderId: string; transactionId: string; paymentUrl: { web: string; app?: string } } }> {
        return this.http.post<any>(
            `${this.API}/payments/linepay/request`,
            { orderId },   // 後端會根據 orderId 查金額/品項，並呼叫 LinePayService.Request
            { withCredentials: true }
        );
    }

    confirmFundLinePay(transactionId: string, amount: number, orderId?: number | string)
        : Observable<{ returnCode: string; returnMessage: string }> {
        return this.http.post<any>(
            `${this.API}/payments/linepay/confirm`,
            { transactionId, amount, currency: 'TWD', orderId },
            { withCredentials: true }
        );
    }

    /** 依訂單 id 取得 LINE Pay 付款網址 */
    payFundOrder(orderId: number) {
        const url = this.buildUrl(`/api/fund/FundOrders/${orderId}/pay`);
        console.log('[FundService] PATCH', url);
        return this.http.patch<{ url: string }>(url, null, { withCredentials: true });
    }

    /** （可選）完成頁查訂單 */
    getFundOrder(id: number) {
        return this.http.get<any>(`${this.API_ROOT}/api/fund/FundOrders/${id}`, { withCredentials: true });
    }

    getFundProjectById(id: number) {
        return this.http.get<any>(`${this.API}/api/fund/FundProjects/${id}`, { withCredentials: true });
    }

    getFundPlanById(id: number) {
        return this.http.get<any>(`${this.API}/fund/FundPlans/${id}`);
    }

    getMyProposals() {
        return this.http
            .get<any>(`${this.baseUrl}/FundProjects/mine`, {
                params: { includeDeleted: true },
                withCredentials: true
            })
            .pipe(map(res => Array.isArray(res) ? res : (res?.items ?? res?.data ?? [])));
    }


    getMySponsorships() {
        return this.http
            .get<any>(`${this.API}/api/fund/FundOrders/mine`, { withCredentials: true })
            .pipe(map(res => Array.isArray(res) ? res : (res?.items ?? res?.data ?? res?.results ?? res?.value ?? [])));
    }

    softDeleteProject(projectId: number) {
        return this.http.delete<void>(`${this.baseUrl}/FundProjects/${projectId}`, {
            withCredentials: true
        });
    }

    restoreProject(projectId: number) {
        return this.http.patch<void>(`${this.baseUrl}/FundProjects/${projectId}/restore`, null, {
            withCredentials: true
        });
    }
}
