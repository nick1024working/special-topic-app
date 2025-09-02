import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsedBookOrderService } from '../../services/used-book-order.service';
import { OrderDetailDto } from '../../dtos/order-detail.dto';
import { paymentMethodToRepr } from '../../enum/PaymentMethod';
import { deliveryMethodToRepr } from '../../enum/DeliveryMethod';

@Component({
    selector: 'app-ub-checkout-result-page',
    standalone: true,
    imports: [],
    templateUrl: './checkout-result-page.component.html',
    styleUrl: './checkout-result-page.component.css'
})
export class CheckoutResultPageComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly orderSvc = inject(UsedBookOrderService);

    readonly paymentMethodToRepr = paymentMethodToRepr;
    readonly deliveryMethodToRepr = deliveryMethodToRepr;

    status = this.route.snapshot.paramMap.get('status') ?? '';
    orderNo = this.route.snapshot.queryParamMap.get('orderNo') ?? '';

    order = signal<OrderDetailDto | undefined>(undefined)

    ngOnInit(): void {
        if (!this.orderNo)
            return;
        this.orderSvc.getOrderDetail(this.orderNo).subscribe({
            next: (res) => {
                console.log(res);
                this.order.set(res)},
            error: (err) => console.error("[ngOnInit] 取得訂單詳情失敗", err),
        });
    }
}
