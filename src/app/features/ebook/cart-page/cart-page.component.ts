// 檔案路徑: src/app/features/ebook/cart-page/cart-page.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs'; // [新增] 匯入 Subscription

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

import { CartService } from '../services/cart.service'; // [新增] 匯入 CartService
import { CartItemDto } from '../DTOs/cart-item.dto';   // [新增] 匯入 CartItemDto
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NzTableModule, NzDividerModule, NzGridModule,
    NzStatisticModule, NzButtonModule, NzIconModule, NzInputNumberModule,RouterModule, // [新增] 將 RouterModule 加入到 imports 陣列
  ],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css']
})
export class CartPageComponent implements OnInit, OnDestroy { // [修改] 實作 OnDestroy

  cartItems: CartItemDto[] = []; // [修改] 移除假資料，改為空陣列
  totalAmount = 0;
  private cartSubscription!: Subscription; // [新增] 用於儲存訂閱，方便銷毀

  // [新增] 注入 CartService
  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // [修改] 訂閱 cartService 中的購物車項目
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  // [新增] 在元件銷毀時，取消訂閱，避免記憶體洩漏
  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  // 計算總金額 (此方法現在由訂閱觸發)
  calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // [新增] 當數量變更時，通知 service
  onQuantityChange(item: CartItemDto): void {
    if (item.quantity >= 1) {
      this.cartService.updateItemQuantity(item.ebookId, item.quantity);
    }
  }

  // [新增] 當點擊移除時，通知 service
  onRemoveItem(ebookId: number): void {
    this.cartService.removeItem(ebookId);
  }
}