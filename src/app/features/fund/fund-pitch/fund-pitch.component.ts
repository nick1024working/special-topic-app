import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
        if (this.form.invalid || this.dateRangeInvalid()) {
            this.form.markAllAsTouched();
            return;
        }

        const raw = this.form.getRawValue();

        // 你之後要打 API 可以在這裡組 DTO：
        // const dto: ProjectCreateDto = { ... }
        // this.fundSvc.createProject(dto)....

        console.log('[fund-pitch] submit form data', raw);
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
