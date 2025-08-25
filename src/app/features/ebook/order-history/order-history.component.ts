// src/app/features/ebook/order-history/order-history.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { OrderDto } from '../DTOs/order.dto';
import { OrderService } from '../services/order.service';

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzTableModule,

        NzSpinModule
    ],
    templateUrl: './order-history.component.html',
    styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
    // [重大修改] 更新 orders 的型別宣告
    // 告訴 TypeScript，orders 陣列中的物件，除了 OrderDto 的屬性外，還會有一個 expand 屬性
    orders: (OrderDto & { expand: boolean })[] = [];
    isLoading = true; // 用於控制載入中的動畫

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.orderService.getOrders().subscribe(data => {

            // [修改] 使用 Array.map() 為從後端收到的每一筆訂單資料，都加上 expand: false 這個初始屬性
            this.orders = data.map(order => ({ ...order, expand: false }));

            this.isLoading = false;
        });
    }
}
