import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'environments/environment';
import {
    FundProject, FundCategory,
    PagedResult,
    ProjectListDto, ProjectDetailDto,
    CategoryDto, ProjectCreateDto, ProjectUpdateDto, ImageDto, PlanDto, FundPlan
} from './models';

const API = environment.apiBaseUrl?.trim() || '';
const url1 = `${API}/api/projects`;
const url2 = `${API}/api/fund/projects`;
const url3 = `${API}/api/fund/FundProjects`;
const planUrlFundPlans = (pid: number) => `${API}/api/fund/FundPlans/byProject/${pid}`;
// 其它舊別名當作備援（看你是否還需要）
const planUrlFallback1 = (pid: number) => `${API}/api/fund/projects/${pid}/plans`;
const planUrlFallback2 = (pid: number) => `${API}/api/projects/${pid}/plans`;
const planUrlFallback3 = (pid: number) => `${API}/api/fund/DonatePlans/byProject/${pid}`;

export interface CreateProjectDto {
    uid: string;
    donateCategoriesId: number;
    projectTitle: string;
    projectDescription?: string | null;
    targetAmount: number;
    startDate: string;  // ISO 字串
    endDate: string;    // ISO 字串
    longDescription: string;
    // 方案
    plans: Array<{ title: string; price: number; description?: string | null }>;
}

export interface CreateOrderDto {
    uid: string;
    donateProjectId: number;
    totalAmount: number;
    paymentMethod: string; // e.g. 'credit'
}

@Injectable({ providedIn: 'root' })
export class FundService {

    private readonly apiBase = environment.apiBaseUrl;

    private readonly apiBaseUrl: string =
        (environment as any).apiBaseUrl ||
        (environment as any).api ||
        '';

    /** 預設圖（專案與方案無圖時使用） */
    private readonly fallbackImg = 'assets/images/default.png';

    constructor(private http: HttpClient) { }

    // -------- Projects --------

    private fixPath = (p?: string | null) =>
        !p ? undefined : (p.startsWith('http') || p.startsWith('/')) ? p : `${API}/${p}`;

    private readonly API = (environment as any).apiBaseUrl ?? (environment as any).api ?? '';

    /** 取全部專案（簡化：拉一頁大筆數即可） */
    getProjects(options: {
        status?: string; categoryId?: number; keyword?: string;
        page?: number; pageSize?: number;
    } = { page: 1, pageSize: 24 }): Observable<FundProject[]> {
        let params = new HttpParams();
        Object.entries(options).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
        });

        return this.http.get<any>(`${API}/api/fund/FundProjects`, { params }).pipe(
            // 診斷輸出（先觀察後端回來是陣列還是 { items: [...] }）
            tap(res => console.log('[projects raw]', res)),
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.items ?? []);
                return items.map(this.toFundProjectFromList);
            })
        );
    }

    /** 取單筆詳情 */
    getProject(id: number) {
        // 先打 /api/projects，再打 /api/fund/projects，最後打 /api/fund/FundProjects
        return this.http.get<ProjectDetailDto>(`${url1}/${id}`).pipe(
            catchError(_ => this.http.get<ProjectDetailDto>(`${url2}/${id}`)),
            catchError(_ => this.http.get<ProjectDetailDto>(`${url3}/${id}`)),
            // 三條都失敗（包含 500）→ 退回用列表找那筆，至少把列表型資料顯示出來
            catchError(err =>
                this.getProjects({ page: 1, pageSize: 999 }).pipe(
                    map(list => {
                        const found = list.find(x => x.id === id);
                        if (!found) throw err; // 找不到才把原錯誤丟回去
                        return found;          // 直接回 FundProject（列表形）
                    })
                )
            ),
            // 上面三條成功會得到 DTO，這裡轉成 FundProject；若是 fallback 已是 FundProject 就原樣回傳
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
        return this.http.get<CategoryDto[]>(`${API}/api/fund/categories/all`)
            .pipe(map(arr => arr.map(this.toFundCategory)));
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
        isFavorite: x.isFavorite
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
    });

    private toFundCategory = (c: CategoryDto): FundCategory => ({
        id: c.donateCategoriesId,
        name: c.categoriesName
    });

    createProject(dto: CreateProjectDto) {
        return this.http.post<{ donateProjectId: number }>(`${this.API}/FundProjects`, dto);
    }

    uploadImage(projectId: number, file: File, isMain = true) {
        const form = new FormData();
        form.append('file', file);
        return this.http.post(
            `${API}/api/fund/FundProjects/${projectId}/images?isMain=${isMain}`,
            form
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

    uploadPlanImage(planId: number, file: File) {
        const form = new FormData();
        form.append('file', file);
        return this.http.post<PlanDto>(`${API}/api/fund/FundPlans/${planId}/image`, form)
            .pipe(map(dto => this.toFundPlan(dto)));
    }

    createPlan(input: any /* 或 PlanCreateInput */): Observable<FundPlan> {
        return this.http
            .post<PlanDto>(`${API}/api/fund/FundPlans`, input)
            .pipe(map(dto => this.toFundPlan(dto)));
    }

    getPlansByProject(projectId: number) {
        return this.http.get<FundPlan[]>(
            `${API}/api/fund/FundPlans/byProject/${projectId}`
        );
    }

    getProjectById(id: number): Observable<FundProject> {
        return this.http.get<FundProject>(`${API}/api/fund/FundProjects/${id}`);
    }

    createOrder(dto: CreateOrderDto) {
        return this.http.post<{ orderId: number }>(`${this.API}/FundOrders`, dto);
    }
}
