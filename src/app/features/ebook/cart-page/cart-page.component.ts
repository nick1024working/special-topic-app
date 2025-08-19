import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'; // [新增]
import { FormsModule } from '@angular/forms'; // [新增]

@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule, // [新增]
        NzTableModule,
        NzDividerModule,
        NzGridModule,
        NzStatisticModule,
        NzButtonModule,
        NzIconModule,
        NzInputNumberModule, // [新增]
    ],
    templateUrl: './cart-page.component.html',
    styleUrls: ['./cart-page.component.css']
})
export class CartPageComponent implements OnInit {

    // [修改] 升級假的購物車商品，加入圖片路徑
    fakeCartItems = [
        {
            id: 1,
            name: '原子習慣',
            price: 280,
            quantity: 1,
            imagePath: '/assets/images/ebooks/atomic-habits.jpg'
        },
        {
            id: 4,
            name: '沙丘',
            price: 450,
            quantity: 1,
            imagePath: '/assets/images/ebooks/dune.jpg'
        },
    ];

    totalAmount = 0;

    ngOnInit(): void {
        this.calculateTotal();
    }

    // 計算總金額
    calculateTotal(): void {
        this.totalAmount = this.fakeCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
}
