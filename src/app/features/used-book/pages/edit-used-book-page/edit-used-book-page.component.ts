import { Component, DestroyRef, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageUploaderComponent } from '../../components/image-uploader/image-uploader.component';
import { UsedBookService } from '../../services/used-book.service';
import { LookupService } from '../../services/lookup.service';
import { IdNameDto } from '../../dtos/id-name.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-ub-edit-used-book-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        ImageUploaderComponent,
    ],
    templateUrl: './edit-used-book-page.component.html',
    styleUrls: [
        './edit-used-book-page.component.css',
        '../../styles/bs-custom-override.scss',
    ],
})
export class EditUsedBookPageComponent {

    // ==================== 注入 ====================
    private fb = inject(FormBuilder);
    private bookSvc = inject(UsedBookService);
    private lookupSvc = inject(LookupService);
    private readonly destroyRef = inject(DestroyRef);

    // ==================== 物件宣告 ====================

    /** 表單本體 */
    form = this.fb.group({

        imageList: this.fb.control<File[]>([], { validators: [this.minLengthArray(1)] }),

        title: ['', [Validators.required]],
        authors: ['', [Validators.required]],
        salePrice: [0, { validators: [Validators.min(0)] }],

        bookCategoryId: this.fb.control<number | null>(null, [Validators.required]),

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
        isOnShelf: this.fb.control(false),
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
    bookCategories: IdNameDto[] = [];
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
                this.bookCategories = res.bookCategories;
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
                    this.c('sellerDistrictId')!.reset(null);   // 回到 placeholder
                    this.c('sellerDistrictId')!.markAsPristine();
                    this.c('sellerDistrictId')!.markAsUntouched();
                    return;
                }
                this.fillDistricts(Number(cityId));
            });

    }

    onSubmit() {
        // 檢查
        // console.log(this.form.getRawValue());
        this.submitted = true;
        this.form.markAllAsTouched();

        if (this.form.invalid) {
            this.scrollToFirstError();
            return;
        }

        this.submitting = true;

        // 取值
        const raw = this.form.getRawValue();

        // 組 FormData
        const formData = new FormData();
        for (const f of raw.imageList ?? []) {
            formData.append('ImageList', f, f.name);
        }

        formData.append('SellerDistrictId', String(raw.sellerDistrictId ?? 0));
        formData.append('SalePrice', String(raw.salePrice ?? 0));
        formData.append('Title', raw.title ?? '');
        formData.append('Authors', raw.authors ?? '');
        formData.append('CategoryId', String(raw.bookCategoryId ?? 0));

        formData.append('ConditionRatingId', String(raw.conditionRatingId ?? 0));
        if (raw.conditionDescription) formData.append('ConditionDescription', raw.conditionDescription);
        if (raw.edition) formData.append('Edition', raw.edition);
        if (raw.publisher) formData.append('Publisher', raw.publisher);
        if (raw.publicationDate) formData.append('PublicationDate', raw.publicationDate);
        if (raw.isbn) formData.append('Isbn', raw.isbn);

        formData.append('BindingId', String(raw.bindingId));
        formData.append('LanguageId', String(raw.languageId));
        if (raw.pages) formData.append('Pages', String(raw.pages));
        formData.append('ContentRatingId', String(raw.contentRatingId ?? 0));

        formData.append('IsOnShelf', String(raw.isOnShelf));

        formData.forEach((value, key) => {
            console.log(key, value);
        });

        // 呼叫 API
        this.bookSvc.creatBook(formData).subscribe({
            next: (res) => { alert("成功" + res); },
            error: (err) => { alert("失敗" + err); },
            complete: () => this.submitting = false
        });

        this.form.reset();
        this.submitting = false;
        this.submitted = false;
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
