import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, from, of } from 'rxjs';
import { FundService } from '../fund.service';
import { ProjectCreateDto } from '../models';
import { AuthService } from '../auth.service';
import { concatMap, catchError, last } from 'rxjs/operators';

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
        this.loadCategories();
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
    removePlan(i: number): void {
        if (this.plansFA.length > 1) this.plansFA.removeAt(i);
    }

    private newPlanGroup(): FormGroup {
        return this.createPlanGroup();
    }

    private ensurePlanBufferLength(): void {
        const n = this.plans.length;
        while (this.planFiles.length < n) this.planFiles.push(null);
        while (this.planPreviewUrls.length < n) this.planPreviewUrls.push(null);
    }

    submit() {
        if (!this.auth.requireLogin()) return;

        // 取最原始表單值（避免 disabled 讀不到）
        const fv = (this.form.getRawValue?.() ?? this.form.value ?? {}) as any;

        // 方案：清洗
        const plansRaw: any[] = this.plansFA.getRawValue();
        const cleanedPlans = plansRaw
            .map(p => ({
                title: (p?.planTitle ?? p?.title ?? '').trim(),
                price: Number(p?.price ?? 0),
                description: (p?.planDescription ?? p?.description ?? null) || null
            }))
            .filter(p => p.title.length > 0 && p.price > 0);

        // 必填檢查
        const missing: string[] = [];
        const categoryId = +(fv.categoryId ?? fv.donateCategoriesId ?? 0);
        const targetAmount = +(fv.targetAmount ?? 0);
        const startDate = fv.startDate ?? null;
        const endDate = fv.endDate ?? null;
        if (!fv.projectTitle?.trim()) missing.push('專案名稱');
        if (!categoryId) missing.push('分類');
        if (!targetAmount || targetAmount <= 0) missing.push('金額');
        if (!startDate) missing.push('開始日期');
        if (!endDate) missing.push('結束日期');
        if (!fv.shortDescription?.trim()) missing.push('簡介');
        if (!fv.longDescription?.trim()) missing.push('說明');
        if (cleanedPlans.length === 0) missing.push('至少一個有效方案');

        // 日期區間檢查
        const sd = startDate ? new Date(startDate) : null;
        const ed = endDate ? new Date(endDate) : null;
        const rangeInvalid =
            sd && ed && !Number.isNaN(sd.getTime()) && !Number.isNaN(ed.getTime())
                ? (ed < sd)
                : false;

        if (missing.length || rangeInvalid) {
            this.form.markAllAsTouched();
            alert(missing.length ? `請檢查必填欄位（${missing.join('、')}）` : '結束日期需晚於（或等於）開始時間');
            return;
        }

        this.isSubmitting = true;

        const uid = this.auth.getUid();
        if (!uid) {
            this.isSubmitting = false;
            alert('登入狀態已失效，請重新登入');
            return;
        }

        // DTO（前端型別）
        const dto: ProjectCreateDto = {
            uid,
            donateCategoriesId: +fv.categoryId,
            projectTitle: fv.projectTitle.trim(),
            projectDescription: fv.shortDescription,
            projectLongDescription: fv.longDescription,
            targetAmount: +fv.targetAmount,
            startDate: new Date(fv.startDate).toISOString(),
            endDate: new Date(fv.endDate).toISOString(),
            plans: cleanedPlans
        };

        // payload 同時帶上後端常用鍵名
        const payload: any = {
            ...dto,
            title: dto.projectTitle,
            description: dto.projectDescription,
            longDescription: dto.projectLongDescription,
            plans: cleanedPlans.map(p => ({
                ...p,
                planTitle: p.title,
                planDescription: p.description
            }))
        };

        // 建立專案
        this.fundSvc.createProject(payload).subscribe({
            next: (resp: any) => {
                // 取專案 Id（body 或 Location header）
                const body = resp?.body ?? resp ?? {};
                let projectId =
                    body?.donateProjectId ??
                    body?.projectId ??
                    body?.id ??
                    body?.donateProject_id ??
                    body?.data?.donateProjectId ??
                    body?.data?.projectId ??
                    body?.data?.id ?? null;

                if (!projectId && resp?.headers) {
                    const loc = resp.headers.get('Location') || resp.headers.get('location');
                    if (loc) {
                        const last = loc.split('/').filter(Boolean).pop();
                        const n = Number(last);
                        if (!Number.isNaN(n)) projectId = n;
                    }
                }

                if (!projectId) {
                    console.error('[createProject] 無法取得專案 Id：', resp);
                    alert('提案已送出，但未取得專案編號。');
                    this.isSubmitting = false;
                    return;
                }

                // 逐筆新增方案（使用你現有的 fundSvc.createPlan）
                const planInputs = cleanedPlans.map(p => ({
                    donateProjectId: +projectId,
                    planTitle: p.title,
                    price: p.price,
                    planDescription: p.description
                }));

                const proceedToCoverAndNavigate = () => {
                    const cover: File | null = (this as any).coverFile ?? null;
                    if (!cover) {
                        this.router.navigate(['/fund', 'fund-done', projectId]);
                        this.isSubmitting = false;
                        return;
                    }
                    this.fundSvc.uploadProjectCover(+projectId, cover).subscribe({
                        next: () => this.router.navigate(['/fund', 'fund-done', projectId]),
                        error: () => this.router.navigate(['/fund', 'fund-done', projectId]),
                        complete: () => (this.isSubmitting = false)
                    });
                };

                if (planInputs.length === 0) {
                    // 理論上不會走到這裡（前面已檢查），加保險
                    proceedToCoverAndNavigate();
                    return;
                }

                from(planInputs).pipe(
                    concatMap(pi => this.fundSvc.createPlan(pi).pipe(
                        // 任一筆失敗不影響後續
                        catchError(err => { console.warn('[createPlan] 失敗', err); return of(null); })
                    )),
                    last() // 等所有方案都嘗試完
                ).subscribe({
                    next: () => proceedToCoverAndNavigate(),
                    error: () => proceedToCoverAndNavigate()
                });
            },
            error: (err) => {
                console.error('[createProject] 失敗：', err);
                alert(err?.error?.message ?? '提案失敗');
                this.isSubmitting = false;
            }
        });
    }
}
