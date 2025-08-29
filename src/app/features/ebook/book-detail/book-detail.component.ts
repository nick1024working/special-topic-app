import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { BOOKS_DATA } from '../book-list/books.data';
import { EbookService } from '../services/ebook.service';


import { CartService } from 'app/shared/services/cart.service';

// [新增] 引入 DTO 與 Sidebar API
import { UpsertCartItemRequest } from 'app/shared/dtos/upsert-cart-item-request.dto';
import { CartSidebarApi } from 'app/shared/components/cart-sidebar/cart-sidebar.api';

import { EBookSummaryDto } from '../DTOs/ebook-summary.dto';

// [新增] 匯入 Alert 模組
import { NzAlertModule } from 'ng-zorro-antd/alert';



@Component({
    selector: 'app-book-detail',
    standalone: true,
    imports: [
        CommonModule, RouterModule, NzGridModule,
        NzButtonModule, NzIconModule, NzCarouselModule, NzAlertModule // [修改] 將 NzMessageModule 換成 NzAlertModule
    ],
    templateUrl: './book-detail.component.html',
    styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {

    book: any;

    // [新增] 用於控制 alert 提示框的屬性
    isAlertVisible = false;
    alertMessage = '';
    private alertTimeout: any;

    // [修改] 移除 NzMessageService，注入 CartService
    constructor(
        private route: ActivatedRoute,
        private cartSvc: CartService,
        private ebookService: EbookService,
        private cartSidebarApi: CartSidebarApi // [修改] 在此注入 SideBar API
    ) { }

    ngOnInit(): void {
        const bookIdStr = this.route.snapshot.paramMap.get('id');

        if (bookIdStr) {
            const bookId = +bookIdStr;

            if (bookId > 300 && bookId < 10000) {
                // --- [修改] 假資料處理邏輯，補上新欄位 ---
                const fakeBook = BOOKS_DATA.find(b => b.ebookId === bookId);
                if (fakeBook) {
                    this.book = {
                        ...fakeBook,
                        // 手動補上後端 DTO 才有的欄位，給予預設值
                        publisher: '測試出版社',
                        bookDescription: '這是來自前端假資料的書籍詳細描述，用於測試排版效果。',
                        imagePaths: [fakeBook.primaryCoverPath],
                        // [新增] 補上詳細資料的假資料
                        categoryName: '商業理財',
                        labels: ['理財規劃', '個人理財'],
                        translator: '王小明',
                        publishedDate: '2023-08-15', // 提供字串格式即可
                        language: '繁體中文',
                        isbn: '978-986-123-456-7',
                        eisbn: '978-986-123-456-8',
                        ebookDataType: 'EPUB'
                    };
                }
            } else {
                // 真實資料，呼叫 API (維持不變)
                this.ebookService.getEbookById(bookId).subscribe(data => {
                    this.book = data;
                });
            }
        }
    }
    // [新增] Getter：用來決定要顯示的「售價」
    get displayActualPrice(): number {
        // 如果 book 物件存在，且 actualPrice 有值 (大於0)，就用 actualPrice
        // 否則，就用 fixedPrice 作為預設值
        if (this.book && this.book.actualPrice > 0) {
            return this.book.actualPrice;
        }
        return this.book ? this.book.fixedPrice : 0;
    }

    // [新增] Getter：用來判斷是否要在「定價」上顯示刪除線
    get showStrikethrough(): boolean {
        // 如果 book 物件存在，且 actualPrice 有值(大於0)，且售價 < 定價，就回傳 true
        return this.book &&
            this.book.actualPrice > 0 &&
            this.book.actualPrice < this.book.fixedPrice;
    }

    // [新增] 計算折扣的函式 (與 book-list 中的版本相同)
    calculateDiscount(fixedPrice: number, actualPrice: number): string {
        if (!actualPrice || actualPrice <= 0 || actualPrice >= fixedPrice) {
            return '';
        }
        const discountFactor = (actualPrice / fixedPrice) * 10;
        const formattedDiscount = discountFactor.toFixed(1).replace(/\.0$/, '');
        return `${formattedDiscount}折`;
    }

    // // [修改] 改為呼叫我們自訂的 showAlert 方法
    // addToCart(): void {
    //     if (!this.book) {
    //         return;
    //     }
    //     this.cartService.addToCart(this.book as EBookSummaryDto);
    //     this.showAlert(`《${this.book.ebookName}》已成功加入購物車`);
    // }

    // [重大修改] 完整改寫 addToCart 方法
    addToCart(): void {
        // 1. 根據 DTO 格式，建立請求物件
        const req: UpsertCartItemRequest = {
            productProvider: 'EBook', // 因為這裡是電子書列表，所以直接指定為 'EBook'
            id: this.book.ebookId.toString(),              // 請確保 EBookSummaryDto 中有 'id' 屬性
            name: this.book.ebookName,
            imageUrl: this.book.primaryCoverPath ?? 'https://dummyimage.com/350x500/cccccc/000.png&text=No+Image', // 請確保 EBookSummaryDto 中有 'coverImageUrl' 屬性
            unitPrice: this.book.actualPrice ?? this.book.fixedPrice, // 優先使用實際售價
            quantity: 1               // 每次點擊都是新增一本
        };

        // 2. 呼叫 CartService 的 upsertItem
        this.cartSvc.upsertItem(req).subscribe({
            next: () => {
                // 3. 成功後，顯示提示訊息
                this.showAlert(`《${this.book.ebookName}》已成功加入購物車`);
                // 4. 呼叫 sidebar API 的 show() 方法，它會負責展開並刷新購物車
                this.cartSidebarApi.show();
            },
            error: (err) => {
                console.error('加入購物車失敗:', err);
                this.showAlert('加入購物車失敗，請稍後再試');
            }
        });
    }


    // [新增] 手動顯示/隱藏提示框的方法
    private showAlert(message: string, duration: number = 3000): void {
        if (this.alertTimeout) {
            clearTimeout(this.alertTimeout);
        }
        this.alertMessage = message;
        this.isAlertVisible = true;
        this.alertTimeout = setTimeout(() => {
            this.isAlertVisible = false;
        }, duration);
    }

}
