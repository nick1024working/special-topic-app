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


@Injectable({ providedIn: 'root' })
export class FundService {
    constructor(private http: HttpClient) { }

    // -------- Projects --------

    private fixPath = (p?: string | null) =>
        !p ? undefined : (p.startsWith('http') || p.startsWith('/')) ? p : `${API}/${p}`;



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

    private toFundProjectFromDetail = (x: ProjectDetailDto): FundProject => ({
        id: x.donateProjectId,
        projectTitle: x.projectTitle,
        projectDescription: x.projectDescription ?? undefined,
        projectLongDescription: x.projectDescription ?? undefined,
        currentAmount: x.currentAmount,
        targetAmount: x.targetAmount,
        startDate: x.startDate,
        endDate: x.endDate,
        backerCount: x.backerCount,
        status: (x.status as any) ?? '募資中',
        mainImagePath: this.fixPath(x.mainImagePath),
        gallery: (x.gallery ?? []).map(g => this.fixPath(g)!)
    });

    private toFundCategory = (c: CategoryDto): FundCategory => ({
        id: c.donateCategoriesId,
        name: c.categoriesName
    });

    createProject(dto: ProjectCreateDto) {
        return this.http.post<ProjectDetailDto>(`${API}/api/fund/projects`, dto)
            .pipe(map(this.toFundProjectFromDetail));
    }

    uploadImage(projectId: number, file: File, isMain: boolean) {
        const form = new FormData();
        form.append('file', file);
        return this.http.post<ImageDto>(`${API}/api/fund/projects/${projectId}/images/upload?isMain=${isMain}`, form);
    }

    // 轉型：PlanDto -> FundPlan
    // PlanDto -> FundPlan
    private toFundPlan = (x: PlanDto): FundPlan => ({
        id: x.donatePlanId,
        projectId: x.donateProjectId,
        title: x.planTitle,
        price: x.price,
        description: x.planDescription ?? undefined,
        imagePath: this.fixPath(x.planImagePath)
    });

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
}
