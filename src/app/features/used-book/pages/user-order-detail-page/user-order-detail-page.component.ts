import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsedBookOrderService } from '../../services/used-book-order.service';
import { paymentMethodToRepr } from '../../enum/PaymentMethod';
import { deliveryMethodToRepr } from '../../enum/DeliveryMethod';
import { OrderDetailDto } from '../../dtos/order-detail.dto';

@Component({
    selector: 'app-ub-user-order-detail-page',
    standalone: true,
    imports: [],
    templateUrl: './user-order-detail-page.component.html',
    styleUrl: './user-order-detail-page.component.css'
})
export class UserOrderDetailPageComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly orderSvc = inject(UsedBookOrderService);

    readonly paymentMethodToRepr = paymentMethodToRepr;
    readonly deliveryMethodToRepr = deliveryMethodToRepr;

    orderNo = this.route.snapshot.paramMap.get('orderNo') ?? '';

    order = signal<OrderDetailDto | undefined>(undefined)

    ngOnInit(): void {
        if (!this.orderNo)
            return;
        this.orderSvc.getOrderDetail(this.orderNo).subscribe({
            next: (res) => {
                this.order.set(res)
            },
            error: (err) => console.error("[ngOnInit] 取得訂單詳情失敗", err),
        });
    }
}
