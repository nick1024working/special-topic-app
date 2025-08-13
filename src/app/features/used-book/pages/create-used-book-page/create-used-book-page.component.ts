import { Component, DestroyRef, inject, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { IdNameDto } from '../../dtos/id-name.dto';
import { LookupService } from '../../services/lookup.service';
import { ImageUploaderComponent } from "../../components/image-uploader/image-uploader.component";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-ub-create-used-book-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        ImageUploaderComponent,
    ],
    templateUrl: './create-used-book-page.component.html',
    styleUrls: [
        './create-used-book-page.component.css',
        '../../styles/bs-custom-override.scss',
    ],
    encapsulation: ViewEncapsulation.Emulated
})
export class CreateUsedBookPageComponent {

    // ==================== 注入 ====================
    private fb = inject(FormBuilder);
    private lookupSvc = inject(LookupService);
    private readonly destroyRef = inject(DestroyRef);

    // ==================== 物件宣告 ====================

    /** 表單本體 */
    form = this.fb.group({

        imageList: this.fb.control<File[]>([], { validators: [this.minLengthArray(1)] }),

        title: ['', [Validators.required]],
        authors: ['', [Validators.required]],
        salePrice: [0, { validators: [Validators.min(0)] }],

        conditionRatingId: this.fb.control<number | null>(null, [Validators.required]),
        conditionDescription: ['', { validators: [Validators.maxLength(100)] }],

        publisher: this.fb.control<string | null>(null),
        publicationDate: this.fb.control<string | null>('1960-04-16'),
        isbn: this.fb.control<string | null>(null, { validators: [Validators.pattern(/^\d{10}(\d{3})?$/)] }),
        pages: this.fb.control<number | null>(null, { validators: [Validators.min(0)] }),

        edition: this.fb.control<string | null>(null),
        bindingId: this.fb.control<number | null>(null, [Validators.required]),
        languageId: this.fb.control<number | null>(null, [Validators.required]),
        contentRatingId: this.fb.control<number | null>(null, [Validators.required]),
        isOnShelf: false,
        sellerCountyId: this.fb.control<number | null>(null, [Validators.required]),
        sellerDistrictId: this.fb.control<number | null>(null, [Validators.required]),
    });


    /** 圖片 接住輸出並更新表單控制項 */
    onImagesChanged(files: File[]) {
        this.c('imageList').setValue(files);
        this.c('imageList').markAsTouched();
        this.c('imageList').updateValueAndValidity();
        this.coverPreviewUrl = this.getFirstImageUrlOrDefault();
    }

    /** 圖片 讀表單控制項的第一張 */
    getFirstImageUrlOrDefault(): string {
        const files = this.c('imageList').value;
        if (!files || files.length === 0) return String.raw`http://placehold.co/400x600?text=No\nCover`;
        return URL.createObjectURL(files[0]);
    }

    /** 表單中封面預覽 url */
    coverPreviewUrl: string = String.raw`http://placehold.co/400x600?text=No\nCover`;
    /** 表單中選中書況評等後的說明 */
    bookCondDesc: string = '請先選擇書況評等';

    // 以下為所有下拉選單資料，將由 ngOnInit 時呼叫後端提供
    bookBindings: IdNameDto[] = [];
    bookConditionRatings: IdNameDto[] = [];
    contentRatings: IdNameDto[] = [];
    counties: IdNameDto[] = [];
    languages: IdNameDto[] = [];
    districts: IdNameDto[] = []; // 建議根據選縣市動態更新

    // 以下為表單送出狀態
    submitted = false;
    submitting = false;

    // ==================== 工具函數 ====================

    /** 用來方便取得 FormControl 的 工具函數 */
    public c(name: string) {
        return this.form.get(name)!;
    }

    /** array 驗證器 */
    private minLengthArray(min: number) {
        return (ctrl: AbstractControl) => {
            const v = ctrl.value as unknown[];
            return Array.isArray(v) && v.length >= min ? null : { minLengthArray: { min } };
        };
    }

    /**  截斷取整的工具函數 */
    public clampInt(name: string = '', min = 0, max = 999999) {
        const ctrl = this.form.get(name) as FormControl<number | null> | null;
        if (!ctrl) return;

        const raw = ctrl.value;
        let v = Number.parseInt(String(raw ?? ''), 10);
        if (Number.isNaN(v)) v = min;

        v = Math.floor(Math.max(min, Math.min(max, v)));
        ctrl.setValue(v, { emitEvent: false });
    }

    /** 捲到第一個 .is-invalid 並聚焦
     *  專門為表單送出時得錯誤處裡設計。
     */
    private scrollToFirstError() {
        setTimeout(() => {
            const el = document.querySelector('.is-invalid') as HTMLElement | null;
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus?.();
            }
        }, 0);
    }

    private isEmptyOption(v: unknown) {
        return v === '' || v === null || v === undefined;
    }

    // ==================== 核心函數 ====================

    ngOnInit(): void {
        this.lookupSvc.GetAllUsedBookUILookupsList().subscribe({
            next: (res) => {
                this.bookBindings = res.bookBindings;
                this.bookConditionRatings = res.bookConditionRatings;
                this.contentRatings = res.contentRatings;
                this.counties = res.counties;
                this.languages = res.languages;
            },
            error: (err) => console.error('[ngOnInit]取得UI清單時失敗', err),
        });
        // Reactive Form 監聽事件: 選中書況評級，載入說明
        this.c('conditionRatingId')!.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((ratingId) => {
                if (this.isEmptyOption(ratingId)) {
                    this.bookCondDesc = '請先選擇書況評等';
                    return;
                }
                this.fillCondDesc(Number(ratingId));
            });
        // Reactive Form 監聽事件: 選中縣市，載入鄉鎮市區
        this.c('sellerCountyId')!.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((cityId) => {
                if (this.isEmptyOption(cityId)) {
                    this.districts = [];
                    this.c('sellerDistrictId')!.reset('');   // 回到 placeholder
                    this.c('sellerDistrictId')!.markAsPristine();
                    this.c('sellerDistrictId')!.markAsUntouched();
                    return;
                }
                this.fillDistricts(Number(cityId));
            });

    }

    onSubmit() {
        console.log(this.form.getRawValue());

        this.submitted = true;
        this.form.markAllAsTouched();

        if (this.form.invalid) {
            this.scrollToFirstError();
            return;
        }

        this.submitting = true;

        // 取值（用 getRawValue 型別更準）
        const raw = this.form.getRawValue();

        // 組 payload
        const payload = {
            ...raw,
        };

        console.log('SUBMIT payload:', payload);

        // ❸ TODO: 呼叫 API
        // this.yourService.create(payload).subscribe({
        //   next: () => { ...成功流程... },
        //   error: () => { ...錯誤處理... },
        //   complete: () => this.submitting = false
        // });

        // demo：模擬完成
        setTimeout(() => {
            this.submitting = false;
            // 成功後若要清空表單：
            // this.form.reset({ salePrice: null, conditionRatingId: '' });
            // this.submitted = false;
        }, 600);
    }

    fillCondDesc(id: number): void {
        this.lookupSvc.GetBookConditionRatingDescriptionById(id).subscribe({
            next: (res) => {
                this.bookCondDesc = res.description;
            },
            error: (err) => console.error('[fillCondDesc]取得書況說明失敗', err),
        });
    }

    fillDistricts(id: number): void {
        this.lookupSvc.GetDistrictListByCountyId(id).subscribe({
            next: (res) => {
                this.c('sellerDistrictId')!.setValue(null, { emitEvent: false });
                this.c('sellerDistrictId')!.markAsPristine();
                this.c('sellerDistrictId')!.markAsUntouched();
                this.districts = [];
                this.districts = res;
            },
            error: (err) => console.error('[fillDistricts]取得鄉鎮市區清單失敗', err),
        });
    }
}
