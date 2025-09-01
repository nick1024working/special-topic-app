import { PaymentStatus, paymentStatusToRepr } from './../../enum/PaymentStatus';
import { Component, inject, signal } from '@angular/core';
import { UsedBookOrderService } from '../../services/used-book-order.service';
import { UserOrderListItemDto } from '../../dtos/user-order-list-item.dto';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeliveryStatus, deliveryStatusToRepr } from '../../enum/DeliveryStatus';
import { OrderStatus, orderStatusToRepr } from '../../enum/OrderStatus';

@Component({
    selector: 'app-ub-user-order-list-page',
    standalone: true,
    imports: [RouterLink, CommonModule],
    templateUrl: './user-order-list-page.component.html',
    styleUrl: './user-order-list-page.component.css'
})
export class UserOrderListPageComponent {
    private readonly orderSvc = inject(UsedBookOrderService);

    readonly orderStatusToRepr = orderStatusToRepr;
    readonly paymentStatusRepr = paymentStatusToRepr
    readonly deliveryStatusRepr = deliveryStatusToRepr;

    // 資料容器
    orderList = signal<UserOrderListItemDto[]>([]);

    // UI 用
    nowTab = signal<OrderTab>('BuyerOrders');

    // ========== 核心函數 ==========

    setTab(tab: OrderTab) {
        this.nowTab.set(tab);
        this.loadList();
    }

    private loadList() {
        if (this.nowTab() === 'BuyerOrders') {
            this.orderSvc.getBuyerOrderList().subscribe({
                next: (res) => {
                    console.log(res);
                    this.orderList.set(res);
                },
                error: (err) => console.error('[loadList]取得訂單清單失敗', err),
            });
        } else if (this.nowTab() === 'SellerOrders') {
            this.orderSvc.getSellerOrderList().subscribe({
                next: (res) => {
                    console.log(res);
                    this.orderList.set(res);
                },
                error: (err) => console.error('[loadList]取得訂單清單失敗', err),
            });
        }
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this.loadList();
    }

    // ========== 工具函數 ==========

    // ========== 其他 ==========

    orderStatusColor: Record<OrderStatus, string> = {
        [OrderStatus.Pending]: 'bg-warning',
        [OrderStatus.Processing]: 'bg-warning',
        [OrderStatus.Confirmed]: 'bg-primary',
        [OrderStatus.Completed]: 'bg-primary',
        [OrderStatus.Cancelled]: 'bg-gray',
    };

    deliveryStatusColor: Record<DeliveryStatus, string> = {
        [DeliveryStatus.Preparing]: 'bg-warning',
        [DeliveryStatus.Shipped]: 'bg-primary',
        [DeliveryStatus.Delivered]: 'bg-primary',
        [DeliveryStatus.PickedUp]: 'bg-primary',
        [DeliveryStatus.Returning]: 'bg-gray',
        [DeliveryStatus.Returned]: 'bg-gray',
    };

    paymentStatusColor: Record<PaymentStatus, string> = {
        [PaymentStatus.Unpaid]: 'bg-warning',
        [PaymentStatus.Failed]: 'bg-gray',
        [PaymentStatus.Expired]: 'bg-gray',
        [PaymentStatus.Paid]: 'bg-primary',
        [PaymentStatus.Refunding]: 'bg-gray',
        [PaymentStatus.Refunded]: 'bg-gray',
    };

}

const ORDER_TABS  = ['BuyerOrders', 'SellerOrders'] as const;
type OrderTab  = typeof ORDER_TABS[number];
