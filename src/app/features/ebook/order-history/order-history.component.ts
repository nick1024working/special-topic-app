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
        NzCollapseModule,
        NzSpinModule
    ],
    templateUrl: './order-history.component.html',
    styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
    orders: OrderDto[] = [];
    isLoading = true; // 用於控制載入中的動畫

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.orderService.getOrders().subscribe(data => {
            this.orders = data;
            this.isLoading = false;
        });
    }
}
