// 檔案路徑: src/app/features/ebook/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CartItemDto } from '../DTOs/cart-item.dto';
import { EBookSummaryDto } from '../DTOs/ebook-summary.dto';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // 使用 BehaviorSubject 來保存購物車商品陣列，並提供一個初始空陣列
  private cartItems = new BehaviorSubject<CartItemDto[]>([]);

  // 將 BehaviorSubject 轉為公開的 Observable，讓外部元件可以訂閱購物車的變化
  cartItems$ = this.cartItems.asObservable();

  // 導出一個專門計算總商品數量的 Observable，可用於網站 header 的購物車圖示
  cartItemCount$: Observable<number> = this.cartItems$.pipe(
    map(items => items.reduce((count, item) => count + item.quantity, 0))
  );

  constructor() { }

  /**
   * 加入商品到購物車
   * @param book 要加入的書籍物件
   */
  addToCart(book: EBookSummaryDto): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.ebookId === book.ebookId);

    // 決定要加入購物車的價格 (優先使用實際售價)
    const price = (book.actualPrice && book.actualPrice > 0) ? book.actualPrice : book.fixedPrice;

    if (existingItem) {
      // 如果商品已存在，則數量+1
      const updatedItems = currentItems.map(item =>
        item.ebookId === book.ebookId ? { ...item, quantity: item.quantity + 1 } : item
      );
      this.cartItems.next(updatedItems);
    } else {
      // 如果是新商品，則新增一項
      const newItem: CartItemDto = {
        ebookId: book.ebookId,
        ebookName: book.ebookName,
        price: price,
        quantity: 1,
        primaryCoverPath: book.primaryCoverPath
      };
      this.cartItems.next([...currentItems, newItem]);
    }
  }

  /**
   * 更新購物車中某個商品的數量
   * @param ebookId 商品ID
   * @param newQuantity 新的數量
   */
  updateItemQuantity(ebookId: number, newQuantity: number): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.map(item =>
        item.ebookId === ebookId ? { ...item, quantity: newQuantity } : item
    );
    this.cartItems.next(updatedItems);
  }

  /**
   * 從購物車移除商品
   * @param ebookId 要移除的商品ID
   */
  removeItem(ebookId: number): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => item.ebookId !== ebookId);
    this.cartItems.next(updatedItems);
  }

  /**
   * 清空購物車
   */
  clearCart(): void {
    this.cartItems.next([]);
  }
}