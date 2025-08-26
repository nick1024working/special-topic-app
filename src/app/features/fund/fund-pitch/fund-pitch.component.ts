import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, switchMap, concatMap, of, from, forkJoin, map, tap, catchError } from 'rxjs';
import { FundService } from '../fund.service';

type CategoryLike = {
    id?: number;
    name?: string;
    donateCategoryId?: number;
    categoryName?: string;
};

type SimpleCategory = { id: number; name: string };

@Component({
    selector: 'app-fund-pitch',
    standalone: true,                               // ★ standalone
    imports: [CommonModule, FormsModule, ReactiveFormsModule], // ★ 匯入表單模組
    templateUrl: './fund-pitch.component.html',
    styleUrls: ['./fund-pitch.component.css']
})
export class FundPitchComponent implements OnInit, OnDestroy {

    private router = inject(Router);

    form!: FormGroup;

    // 封面檔案 + 預覽
    coverFile: File | null = null;
    coverPreviewUrl: string | null = null;

    // 方案檔案 + 預覽（索引與 FormArray 對應）
    planFiles: (File | null)[] = [];
    planPreviewUrls: (string | null)[] = [];

    // 類別清單（由你的 service 取得）
    categories: { id: number; name: string }[] = [];

    private sub = new Subscription();

    constructor(
        private fb: FormBuilder,
        private fundSvc: FundService
    ) {
        this.form = this.fb.group({
            // 基本資料
            realName: ['', [Validators.required, Validators.maxLength(50)]],
            email: ['', [Validators.required, Validators.email]],

            // 專案設定
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            // 🔸分類一定要存在、為必填
            categoryId: [null, Validators.required],
            targetAmount: [null, [Validators.required, Validators.min(1)]],

            // 文字內容
            shortDescription: ['', [Validators.required, Validators.maxLength(200)]],
            longDescription: ['', [Validators.required, Validators.minLength(20)]],

            // 方案（至少保留一筆，若你要預設兩筆可呼叫 addPlan() 兩次）
            plans: this.fb.array([this.createPlanGroup()])
        });
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
    }

    ngOnDestroy(): void {
        if (this.coverPreviewUrl) URL.revokeObjectURL(this.coverPreviewUrl);
        this.planPreviewUrls.forEach(u => u && URL.revokeObjectURL(u));
    }

    private createPlanGroup(): FormGroup {
        return this.fb.group({
            planTitle: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            planDescription: ['']
        });
    }

    get plans(): FormArray {
        return this.form.get('plans') as FormArray;
    }

    hasError(ctrl: string, err: string): boolean {
        const c = this.form.get(ctrl);
        return !!(c && c.touched && c.hasError(err));
    }

    dateRangeInvalid(): boolean {
        const s = this.form.get('startDate')?.value;
        const e = this.form.get('endDate')?.value;
        if (!s || !e) return false;
        return new Date(e) < new Date(s);
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

    addPlan(): void {
        this.plans.push(this.createPlanGroup());
        this.ensurePlanBufferLength();
    }

    private ensurePlanBufferLength(): void {
        const n = this.plans.length;
        while (this.planFiles.length < n) this.planFiles.push(null);
        while (this.planPreviewUrls.length < n) this.planPreviewUrls.push(null);
    }

    submit(): void {
        this.form.markAllAsTouched();
        if (this.form.invalid || this.dateRangeInvalid()) return;

        const v = this.form.getRawValue();
        const dto = {
            donateCategoriesId: Number(v.categoryId),
            uid: '98c1b4da-677d-416a-87c3-00104af158f5',
            projectTitle: v.realName + ' 的計畫',
            projectDescription: v.shortDescription,
            LongDescription: v.longDescription,
            targetAmount: Number(v.targetAmount),
            startDate: v.startDate,
            endDate: v.endDate,
            isFavorite: false
        };

        this.fundSvc.createProject(dto).pipe(
            // 後端回傳 { donateProjectId }，不要拿錯欄位
            switchMap((res: { donateProjectId: number }) => {
                const projectId = res.donateProjectId;

                // 3-1) 先上傳封面（若有）
                const cover$ = this.coverFile
                    ? this.fundSvc.uploadImage(projectId, this.coverFile!, true)
                        .pipe(catchError(err => { console.error('封面上傳失敗(略過)', err); return of(null); }))
                    : of(null);

                // 3-2) 把 plans 表單值與檔案取出
                const plansRaw = (v.plans ?? []) as Array<{ planTitle: string; price: number; planDescription?: string }>;
                const planFiles = [...this.planFiles]; // 你的 onPlanFileSelected(i, e) 要把 file 存進 this.planFiles[i]

                // 3-3) 依序建立每個方案；若該方案有圖，再上傳方案圖
                const createPlans$ = from(plansRaw).pipe(
                    concatMap((p, idx) => {
                        const input = {
                            donateProjectId: projectId,
                            planTitle: p.planTitle,
                            price: Number(p.price),
                            planDescription: (p.planDescription ?? '').trim()
                        };
                        return this.fundSvc.createPlan(input).pipe(
                            switchMap(createdPlan => {
                                const f = planFiles[idx];
                                if (!f) return of(createdPlan);
                                return this.fundSvc.uploadPlanImage(createdPlan.id, f).pipe(
                                    map(() => createdPlan),
                                    catchError(err => { console.error(`方案圖上傳失敗(略過)`, err); return of(createdPlan); })
                                );
                            })
                        );
                    })
                );

                // 串接：先封面，再建立方案流
                return cover$.pipe(switchMap(() => createPlans$));
            })
        ).subscribe({
            next: () => { },
            error: (err) => {
                console.error('[fund-pitch] 建立流程失敗：', err);
                alert(err?.error?.message ?? '建立專案失敗，請稍後再試。');
            },
            complete: () => {
                this.resetLocalStateAfterSubmit();
                this.router.navigate(['/', 'fund', 'fund-project']);
            }
        });
    }

    private toPlanCreateInput(projectId: number, p: { planTitle: string; price: number; planDescription?: string }) {
        return {
            donateProjectId: projectId,
            planTitle: p.planTitle,
            price: Number(p.price),
            planDescription: (p.planDescription ?? '').trim()
        };
    }

    /** 成功後清理暫存（預覽 URL、檔案陣列、表單） */
    private resetLocalStateAfterSubmit() {
        if (this.coverPreviewUrl) { URL.revokeObjectURL(this.coverPreviewUrl); }
        this.coverPreviewUrl = null;
        this.coverFile = null;
        this.planPreviewUrls.forEach(u => { if (u) URL.revokeObjectURL(u); });
        this.planPreviewUrls = [];
        this.planFiles = [];
        // 你可以選擇 reset() 清空表單，或是保留資料
        // this.form.reset();
    }
}

// 組 FormData 送到 API（保留你原本的 service 呼叫）
// const fd = new FormData();
// const v = this.form.getRawValue();

// fd.append('realName', v.realName);
// fd.append('email', v.email);
// fd.append('startDate', v.startDate);
// fd.append('endDate', v.endDate);
// fd.append('categoryId', String(v.categoryId));
// fd.append('targetAmount', String(v.targetAmount));
// fd.append('shortDescription', v.shortDescription);
// fd.append('longDescription', v.longDescription);
// if (this.coverFile) fd.append('cover', this.coverFile, this.coverFile.name);

// v.plans.forEach((p: any, i: number) => {
//     fd.append(`plans[${i}].planTitle`, p.planTitle);
//     fd.append(`plans[${i}].price`, String(p.price));
//     fd.append(`plans[${i}].planDescription`, p.planDescription ?? '');
//     const f = this.planFiles[i];
//     if (f) fd.append(`plans[${i}].image`, f, f.name);
// });

//         // this.svc.createProject(fd).subscribe(...)
//     }
// }
