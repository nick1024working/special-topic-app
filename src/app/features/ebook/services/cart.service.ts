// 檔案路徑: src/app/features/ebook/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemCount = new BehaviorSubject<number>(0);
  currentCartItemCount = this.cartItemCount.asObservable();

  constructor() { }

  addToCart() {
    const newCount = this.cartItemCount.value + 1;
    this.cartItemCount.next(newCount);
  }
}