import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, from, of } from 'rxjs';
import { FundService } from '../fund.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { concatMap, catchError, last, switchMap, map } from 'rxjs/operators';

type CategoryLike = {
    id?: number;
    name?: string;
    donateCategoryId?: number;
    categoryName?: string;
};

type SimpleCategory = { id: number; name: string };

@Component({
    selector: 'app-fund-pitch',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './fund-pitch.component.html',
    styleUrls: ['./fund-pitch.component.css']
})
export class FundPitchComponent implements OnInit, OnDestroy {

    isSubmitting = false;

    form!: FormGroup;
    coverFile: File | null = null;
    coverPreviewUrl: string | null = null;
    planFiles: (File | null)[] = [];

    // 方案檔案 + 預覽（索引與 FormArray 對應）
    planPreviewUrls: (string | null)[] = [];

    // 類別清單（由你的 service 取得）
    categories: { id: number; name: string }[] = [];

    private sub = new Subscription();

    get plans(): FormArray { return this.form.get('plans') as FormArray; }

    constructor(
        private fb: FormBuilder,
        private fundSvc: FundService,
        public auth: AuthService,
        private router: Router,
    ) {
        this.form = this.fb.group({
            projectTitle: ['', [Validators.required, Validators.maxLength(50)]],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            categoryId: [null, Validators.required],
            targetAmount: [null, [Validators.required, Validators.min(1)]],
            shortDescription: ['', [Validators.required, Validators.maxLength(200)]],
            longDescription: ['', [Validators.required, Validators.minLength(20)]],
            // 方案
            plans: this.fb.array([this.createPlanGroup()])
        });
        this.planFiles.push(null);
    }

    ngOnInit(): void {
        if (!this.auth.isLoggedIn()) {
            alert('請先登入會員');
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }
        this.loadCategories();
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    /** 讀取分類（關鍵修復點） */
    private loadCategories(): void {
        // 你的 service 方法名稱若不同（例如 getFundCategories），請改成實際名稱
        const s = this.fundSvc.getCategories().subscribe({
            next: (raw: CategoryLike[]) => {
                // 正規化不同欄位命名
                this.categories = (raw ?? [])
                    .map(c => ({
                        id: (c.donateCategoryId ?? c.id) as number,
                        name: (c.categoryName ?? c.name) as string
                    }))
                    // 過濾掉資料庫中可能有的空值
                    .filter(c => Number.isFinite(c.id) && !!c.name);
            },
            error: err => {
                console.error('[fund-pitch] 載入分類失敗', err);
                this.categories = [];
            }
        });
        this.sub.add(s);
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    ngOnDestroy(): void {
        if (this.coverPreviewUrl) URL.revokeObjectURL(this.coverPreviewUrl);
        this.planPreviewUrls.forEach(u => u && URL.revokeObjectURL(u));
    }

    //把 price 的下限改為 1，比較符合實務
    private createPlanGroup(): FormGroup {
        return this.fb.group({
            planTitle: ['', Validators.required],
            price: [1, [Validators.required, Validators.min(1)]],
            planDescription: ['']
        });
    }

    hasError(ctrl: string, err: string): boolean {
        const c = this.form.get(ctrl);
        return !!(c && c.touched && c.hasError(err));
    }

    dateRangeInvalid(): boolean {
        const v = (this.form?.getRawValue?.() ?? this.form?.value ?? {}) as any;
        const s = v.startDate ?? v.start_date;
        const e = v.endDate ?? v.end_date;
        if (!s || !e) return false; // 缺一個就不比大小，交給必填檢查
        const sd = new Date(s);
        const ed = new Date(e);
        if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) return false;
        return ed < sd;
    }

    // ----- 檔案/預覽 -----
    onCoverSelected(ev: Event): void {
        const input = ev.target as HTMLInputElement;
        const file = input.files && input.files[0] ? input.files[0] : null;

        if (this.coverPreviewUrl) { URL.revokeObjectURL(this.coverPreviewUrl); this.coverPreviewUrl = null; }
        this.coverFile = file;
        if (file) this.coverPreviewUrl = URL.createObjectURL(file);
    }

    onPlanFileSelected(index: number, ev: Event): void {
        const input = ev.target as HTMLInputElement;
        const file = input.files && input.files[0] ? input.files[0] : null;

        this.ensurePlanBufferLength();

        if (this.planPreviewUrls[index]) {
            URL.revokeObjectURL(this.planPreviewUrls[index]!);
            this.planPreviewUrls[index] = null;
        }
        this.planFiles[index] = file;
        if (file) this.planPreviewUrls[index] = URL.createObjectURL(file);
    }

    planPreview(i: number): string | null {
        return this.planPreviewUrls[i] ?? null;
    }

    get plansFA(): FormArray {
        return this.form.get('plans') as FormArray;
    }

    addPlan(): void {
        this.plansFA.push(this.createPlanGroup());
    }

    // 刪除單筆方案
    removePlan(index: number): void {
        // 前端 UI 已經用 *ngIf 限制 i > 0 才顯示按鈕，這裡再保險一次
        if (index <= 0) return;

        // 1) 先從 FormArray 移除
        this.plans.removeAt(index);
    }

    private ensurePlanBufferLength(): void {
        const n = this.plans.length;
        while (this.planFiles.length < n) this.planFiles.push(null);
        while (this.planPreviewUrls.length < n) this.planPreviewUrls.push(null);
    }

    submit(): void {
        // 依照你的登入機制：未登入先提醒導去登入
        if (!this.auth.isLoggedIn?.() && !(this as any).auth?.requireLogin?.()) {
            alert('請先登入會員');
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }

        if (this.form.invalid || this.dateRangeInvalid()) {
            this.form.markAllAsTouched();
            alert(this.dateRangeInvalid() ? '結束時間需晚於（或等於）開始時間' : '請確認必填欄位已填妥');
            return;
        }

        this.isSubmitting = true;

        const fv: any = this.form.getRawValue?.() ?? this.form.value ?? {};
        const plansRaw: any[] = this.plansFA.getRawValue();

        // 整理有效方案（僅文字）
        const cleanedPlans = plansRaw
            .map(p => ({
                title: String(p?.planTitle ?? '').trim(),
                price: Number(p?.price ?? 0),
                description: (p?.planDescription ?? null) || null
            }))
            .filter(p => p.title.length > 0 && p.price > 0);

        // 必填檢查
        const miss: string[] = [];
        if (!fv.projectTitle?.trim()) miss.push('專案名稱');
        if (!fv.categoryId) miss.push('分類');
        if (!fv.targetAmount || +fv.targetAmount <= 0) miss.push('金額');
        if (!fv.startDate) miss.push('開始日期');
        if (!fv.endDate) miss.push('結束日期');
        if (!fv.shortDescription?.trim()) miss.push('簡介');
        if (!fv.longDescription?.trim()) miss.push('說明');
        if (cleanedPlans.length === 0) miss.push('至少一個有效方案');
        if (miss.length) {
            alert(`請檢查必填欄位（${miss.join('、')}）`);
            this.isSubmitting = false;
            return;
        }

        // 建立專案 DTO
        const dto = {
            donateCategoriesId: Number(fv.categoryId),
            projectTitle: String(fv.projectTitle).trim(),
            projectDescription: String(fv.shortDescription),
            projectLongDescription: String(fv.longDescription),
            targetAmount: Number(fv.targetAmount),
            startDate: new Date(fv.startDate).toISOString(),
            endDate: new Date(fv.endDate).toISOString(),
            plans: cleanedPlans.map(p => ({ title: p.title, price: p.price, description: p.description })),
        };

        this.fundSvc.createProject(dto).subscribe({
            next: (created: any) => {
                let projectId =
                    created?.donateProjectId ?? created?.projectId ?? created?.id ??
                    created?.data?.donateProjectId ?? created?.data?.projectId ?? created?.data?.id ?? null;

                if (!projectId) {
                    console.error('[createProject] 無法取得 projectId：', created);
                    alert('提案已送出，但未取得專案編號。');
                    this.isSubmitting = false;
                    return;
                }

                // 逐筆建立方案，若該索引有上傳檔案則續傳圖片
                this.ensurePlanBufferLength();
                const planIndexSeq$ = from(cleanedPlans.map((p, idx) => ({ p, idx }))).pipe(
                    concatMap(({ p, idx }) =>
                        this.fundSvc.createPlan({
                            donateProjectId: +projectId,
                            planTitle: p.title,
                            price: p.price,
                            planDescription: p.description
                        }).pipe(
                            concatMap((createdPlan: any) => {
                                const planId =
                                    createdPlan?.id ?? createdPlan?.donatePlanId ??
                                    createdPlan?.data?.id ?? createdPlan?.data?.donatePlanId ?? null;
                                const file = this.planFiles[idx] ?? null;
                                if (!planId || !file) return of(null);
                                return this.fundSvc.uploadPlanImage(+planId, file).pipe(
                                    catchError(err => { console.warn('[uploadPlanImage] 失敗', err); return of(null); })
                                );
                            }),
                            catchError(err => { console.warn('[createPlan] 失敗', err); return of(null); })
                        )
                    ),
                    last()
                );

                const goDone = () => {
                    const cover: File | null = this.coverFile;
                    if (!cover) {
                        this.router.navigate(['/fund', 'fund-done', projectId]);
                        this.isSubmitting = false;
                        return;
                    }
                    this.fundSvc.uploadProjectCover(Number(projectId), cover).subscribe({
                        next: () => this.router.navigate(['/fund', 'fund-done', projectId]),
                        error: () => this.router.navigate(['/fund', 'fund-done', projectId]),
                        complete: () => (this.isSubmitting = false)
                    });
                };

                if (cleanedPlans.length === 0) { goDone(); return; }
                planIndexSeq$.subscribe({ next: goDone, error: goDone });
            },
            error: (err) => {
                if (err?.status === 401) {
                    alert('請先登入會員');
                    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
                } else {
                    console.error('[createProject] 失敗：', err);
                    alert(err?.error?.message ?? '提案失敗');
                }
                this.isSubmitting = false;
            }
        });
    }

    private toDateInput(d: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    private ensurePlans(n: number): void {
        const arr = this.plans; // 假設 this.plans 是 FormArray getter
        while (arr.length < n) this.addPlan();
    }

    demoFill(): void {
        // 你只要改這塊 DEMO 內容，就能客製展示資料👇
        const DEMO = {
            projectTitle: '《貓咪也有煩惱》經典插畫選集',
            // start / end 給預設：今天起算，30 天後結束
            startOffsetDays: 0,
            endOffsetDays: 120,
            // 如果你知道類別 id，就直接填數字；不知道就會自動挑第一個 categories
            categoryId: 3, // 例：填 3
            targetAmount: 50000,
            shortDescription: '可愛貓咪日常插畫選集＋限量貓咪贈品回饋！',
            longDescription:
                `《貓咪也有煩惱》是一部集結療癒與幽默的經典插畫選集，描繪貓咪在日常生活中面對的各種煩惱與可愛反應，讓人會心一笑。\n` +
                `本募資計畫希望透過群眾支持，將這部作品實體化出版，並依據不同方案提供專屬回饋：包含限量角色書籤、Q版貓咪壓克力公仔、感謝小卡及明信片套組等，與支持者一起分享貓咪世界的細膩與可愛。若達標還會解鎖全新隱藏插畫篇章與贈品擴充包！\n` +
                `讓我們一起，透過插畫療癒生活，並用行動支持原創創作。你的每一筆贊助，都是推動這本插畫選集實現的重要一步！`,

            // 方案們（可加可減）
            plans: [
                {
                    planTitle: '早貓方案',
                    price: 900,
                    planDescription: '貓咪公仔+貓咪明信片 2 入'
                }
            ]
        };

        // ====== 計算日期（今天 ~ +30 天）======
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() + (DEMO.startOffsetDays ?? 0));
        const end = new Date(now);
        end.setDate(end.getDate() + (DEMO.endOffsetDays ?? 30));

        // ====== 類別：若沒填 DEMO.categoryId，嘗試用第一個 categories ======
        let categoryId = DEMO.categoryId;
        if ((categoryId == null || isNaN(categoryId)) && Array.isArray(this.categories) && this.categories.length > 0) {
            // 依你目前 HTML 結構 categories[i].id
            categoryId = this.categories[0].id;
        }

        // ====== 先填主要欄位 ======
        this.form.patchValue({
            projectTitle: DEMO.projectTitle,
            startDate: this.toDateInput(start),
            endDate: this.toDateInput(end),
            categoryId: categoryId,
            targetAmount: DEMO.targetAmount,
            shortDescription: DEMO.shortDescription,
            longDescription: DEMO.longDescription
        });

        // ====== Plans（不處理圖片欄位）======
        this.ensurePlans(DEMO.plans.length);

        DEMO.plans.forEach((p, i) => {
            // 只填文字/數字，不動圖片
            this.plans.at(i).patchValue({
                planTitle: p.planTitle,
                price: p.price,
                planDescription: p.planDescription
            });
        });
    }
}
