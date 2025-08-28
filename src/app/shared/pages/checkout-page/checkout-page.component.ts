import { providerToRepr } from 'app/shared/types/product-provider';
import { ProductProvider } from './../../types/product-provider';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IdNameDto } from 'app/features/used-book/dtos/id-name.dto';
import { LookupService } from 'app/features/used-book/services/lookup.service';
import { CartDto } from 'app/shared/dtos/cart.dto';
import { CheckoutDraftDto } from 'app/shared/dtos/checkout-draft.dto';
import { CartService } from 'app/shared/services/cart.service';
import { DeliveryOption, deliveryToDesc, deliveryToRepr } from 'app/shared/types/delivery-option';
import { PaymentOption, paymentToRepr, paymentToDesc } from 'app/shared/types/payment-option';
import { phoneValidator } from 'app/shared/validators/phone.validator';
import { switchMap, take, tap } from 'rxjs';

@Component({
    selector: 'app-sh-checkout-page',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './checkout-page.component.html',
    styleUrl: './checkout-page.component.css'
})
export class CheckoutPageComponent {
    private readonly _fb = inject(FormBuilder);
    private readonly _cartSvc = inject(CartService);
    private readonly _lookupSvc = inject(LookupService);
    private readonly _router = inject(Router);

    readonly providerToRepr = providerToRepr;
    readonly paymentToRepr = paymentToRepr;
    readonly paymentToDesc = paymentToDesc;
    readonly deliveryToRepr = deliveryToRepr;
    readonly deliveryToDesc = deliveryToDesc;

    // 資料物件
    provider!: ProductProvider;
    deliveryOpt!: DeliveryOption;
    paymentOpt!: PaymentOption;
    cart!: CartDto;

    // UI使用
    isAllUILoaded: boolean = false;
    countyList = signal<IdNameDto[] | undefined>(undefined);
    districtList = signal<IdNameDto[] | undefined>(undefined);

    // 資料欄位
    form = this._fb.group({
        buyerName: this._fb.control<string | null>(null, { validators: [Validators.required] }),
        buyerEmail: this._fb.control<string | null>(null, { validators: [Validators.required, Validators.email] }),
        buyerPhone: this._fb.control<string | null>(null, { validators: [Validators.required, phoneValidator()] }),
        receiverName: this._fb.control<string | null>(null, { validators: [Validators.required] }),
        receiverPhone: this._fb.control<string | null>(null, { validators: [Validators.required, phoneValidator()] }),
        countyId: this._fb.control<number | null>(null, [Validators.required]),
        districtId: this._fb.control<number | null>(null, [Validators.required]),
        address: this._fb.control<string | null>(null, { validators: [Validators.required] }),
    });
    isSubmitted: boolean = false;

    // ========== 核心函數 ==========

    getErrorRepr(controlName: string): string | null {
        const control = this.form.get(controlName);
        if (!control) return null;

        if (!(control.touched || control.dirty || this.isSubmitted)) return null;

        if (control.hasError('required')) return '必填';
        if (control.hasError('email')) return 'Email格式不正確';
        if (control.hasError('invalidPhone')) return '手機格式不正確';
        if (control.hasError('pattern')) return '格式不正確';

        return null;
    }

    // ========== HOOK ==========

    ngOnInit(): void {

        this._lookupSvc.getCountyList()
            .subscribe({
                next: (res) => this.countyList.set(res),
                error: (err) => console.error("[ngOnInit] 取得縣市清單失敗", err),
            });

        this._cartSvc.getCheckoutDraft()
            .pipe(
                take(1),
                tap(draft => {
                    this.provider = draft.productProvider;
                    this.deliveryOpt = draft.deliveryOption;
                    this.paymentOpt = draft.paymentOption;
                    this.form.patchValue({
                        buyerName: draft.buyerName,
                        buyerEmail: draft.buyerEmail,
                        buyerPhone: draft.buyerPhone,
                        receiverName: draft.receiverName,
                        receiverPhone: draft.receiverPhone,
                        countyId: draft.countyId <= 0 ? null : draft.countyId,
                        districtId: draft.districtId <= 0 ? null : draft.districtId,
                        address: draft.address
                    });
                }),
                switchMap(draft => this._cartSvc.getCartByProvider(draft.productProvider)),
                tap(cart => this.cart = cart),
                tap(() => this.isAllUILoaded = true)
            )
            .subscribe({
                error: (err) => console.error("[ngOnInit] 取得結帳草稿失敗", err),
            });

        this.form.get('countyId')?.valueChanges.subscribe(countyId => {
            this.onCountySelect(countyId);
        });
    }

    // ========== 事件 ==========

    onSameAsCustomerChange(checked: boolean) {
        if (checked) {
            const { buyerName, buyerPhone } = this.form.getRawValue();
            this.form.patchValue({ receiverName: buyerName, receiverPhone: buyerPhone });
        } else {
            this.form.patchValue({ receiverName: null, receiverPhone: null });
        }
    }

    onCountySelect(countyId: number | null) {
        if (countyId == null) {
            console.error("[onCountySelect] 取得鄉鎮市區 id 失敗");
            return;
        }
        this._lookupSvc.getDistrictListByCountyId(countyId)
            .subscribe({
                next: (res) => this.districtList.set(res),
                error: (err) => console.error("[onCountySelect] 取得鄉鎮市區清單失敗", err),
            });
    }

    onSubmit() {
        this.isSubmitted = true;

        // 驗證
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.scrollToFirstError();
            return;
        }

        // 取值
        const formData = this.form.getRawValue();
        const req: CheckoutDraftDto = {
            productProvider: this.provider,
            deliveryOption: this.deliveryOpt,
            paymentOption: this.paymentOpt,
            buyerName: formData.buyerName ?? "",
            buyerEmail: formData.buyerEmail ?? "",
            buyerPhone: formData.buyerPhone ?? "",
            receiverName: formData.receiverName ?? "",
            receiverPhone: formData.receiverPhone ?? "",
            countyId: formData.countyId ?? 0,
            districtId: formData.districtId ?? 0,
            address: formData.address ?? "",
            fullAddress: "",
        }
        this._cartSvc.upsertCheckoutDraft(req).subscribe({
            next: () => this._router.navigate(['/checkout-review']),
            error: (err) => console.error("[onSubmit] 更新結帳草稿失敗", err),
        });
    }

    // ========== 工具函數 ==========

    /** 捲到視窗頂部。
     *  專門為從非頂部跳轉時得設計，可於 HTML 呼叫。
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    /** 捲到第一個 .is-invalid 並聚焦。
     *  專門為表單送出時 UX 錯誤指正設計。
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
}
