import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EbookService } from '../services/ebook.service';
import { PurchasedBookDto } from '../DTOs/purchased-book.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'app/shared/auth/auth.service';
import { Subscription } from 'rxjs';
import { CartService } from 'app/shared/services/cart.service';
import { CartSidebarApi } from 'app/shared/components/cart-sidebar/cart-sidebar.api';

@Component({
    selector: 'app-library-page',
    standalone: true,
    imports: [
        CommonModule, RouterModule, NzCardModule, NzGridModule,
        NzProgressModule, FormsModule, NzInputModule, NzIconModule, NzButtonModule
    ],
    templateUrl: './library-page.component.html',
    styleUrls: ['./library-page.component.css']
})
export class LibraryPageComponent implements OnInit, OnDestroy {

    // [新增] 一個 flag 來判斷登入狀態
    isLoggedIn = true;

    private authSubscription!: Subscription; // <--- 用於儲存訂閱

    // 【步驟 2】【關鍵修正】改用 inject() 在屬性區注入服務，這是 Angular 14+ 的最佳實踐
    private readonly router = inject(Router);
    private readonly ebookService = inject(EbookService);
    private readonly message = inject(NzMessageService);
    private readonly authService = inject(AuthService);
    private readonly cartSvc = inject(CartService);
    private readonly cartSidebarApi = inject(CartSidebarApi);

    private fakePurchasedBooks: any[] = [
        {
            ebookId: 301,
            ebookName: '原子習慣 ',
            author: '詹姆斯‧克利爾',
            primaryCoverPath: '/assets/images/ebooks/atomic-habits.jpg',
            isReadable: true,
            readingProgress: "75"
        },
        {
            ebookId: 305,
            ebookName: '流浪的地球',
            author: '劉慈欣',
            primaryCoverPath: '/assets/images/ebooks/wandering-earth.jpg',
            isReadable: true,
            readingProgress: "20"
        },
        {
            ebookId: 308,
            ebookName: '解憂雜貨店',
            author: '東野圭吾',
            primaryCoverPath: '/assets/images/ebooks/namiya.jpg',
            isReadable: true,
            readingProgress: "0"
        }
    ];

    purchasedBooks: PurchasedBookDto[] = [];
    filteredBooks: PurchasedBookDto[] = [];
    searchText = '';

    // constructor(
    //     private router: Router,
    //     private ebookService: EbookService,
    //     private message: NzMessageService,
    //     private authService: AuthService // <-- [新增] 注入 AuthService
    // ) { }
   

    ngOnInit(): void {
         // 【步驟 3】加入清空購物車的邏輯
        this.handlePaymentReturn();
       // this.loadPurchasedBooks();
       // [核心修改] 訂閱 authService 的 user$ 狀態變化
        this.authSubscription = this.authService.user$.subscribe(user => {
            if (user) {
                // 如果 user 物件存在，代表已登入
                this.isLoggedIn = true;
                this.loadPurchasedBooks(); // 執行載入書櫃的邏輯
            } else {
                // 如果 user 物件為 null，代表已登出
                this.isLoggedIn = false;
                this.purchasedBooks = []; // 清空書櫃資料
                this.filterBooks();       // 更新顯示
            }
        });
    }

     ngOnDestroy(): void {
        // 在元件銷毀時，取消訂閱，避免記憶體洩漏
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

     // 【步驟 4】建立一個獨立的方法來處理清空邏輯，讓 ngOnInit 更乾淨
    private handlePaymentReturn(): void {
        const orderId = sessionStorage.getItem('ecpay_order_id');
        // 檢查 sessionStorage 中是否有我們存的「暗號」
        if (orderId) {
            console.log(`檢測到從 ECPay 返回，訂單 ID: ${orderId}，準備清空購物車...`);
            
            // 立刻移除暗號，避免使用者重整頁面時重複觸發
            sessionStorage.removeItem('ecpay_order_id');

            // 呼叫服務來清空電子書的購物車
            this.cartSvc.clearCart().subscribe({
                next: () => {
                    console.log('電子書購物車已清空。');
                    this.cartSidebarApi.show(); // 更新右上角購物車圖示的數字
                    this.message.success('付款成功，購物車已清空！');
                },
                error: (err) => {
                    console.error('清空購物車時發生錯誤', err);
                    this.message.error('清空購物車失敗，請手動移除商品。');
                }
            });
        }
    }

    loadPurchasedBooks(): void {
        this.ebookService.getPurchasedBooks().subscribe({
            next: (realBooks) => {
                console.log("成功從後端載入書籍:", realBooks);
                this.message.success('已成功載入您的書櫃');

                // // --- [修改] 使用更清晰的合併邏輯 ---

                // // 1. 建立一個 Set，存放所有從後端拿到的真實書籍的 ID
                // const realBookIds = new Set(realBooks.map(b => b.ebookId));

                // // 2. 篩選前端的假資料，只保留那些 ID 不在真實書籍 ID 列表中的書籍
                // const uniqueFakeBooks = this.fakePurchasedBooks.filter(fakeBook => !realBookIds.has(fakeBook.ebookId));

                // // 3. 將真實書籍陣列與篩選後的不重複假書籍陣列合併
                // //    這樣可以確保真實書籍永遠排在最前面
                // this.purchasedBooks = [...realBooks, ...uniqueFakeBooks];

                // --- [ 步驟 2: 新增這行程式碼 ] ---
                // 直接使用後端回傳的資料，不混用假資料
                this.purchasedBooks = realBooks;
                // --- [ 新增結束 ] ---


                this.filterBooks();
            },
           // [關鍵修正] 重新設計 error 處理邏輯
            error: (err: HttpErrorResponse) => {
                // 如果是 401 錯誤，明確表示未登入
                if (err.status === 401) {
                    this.isLoggedIn = false;
                    console.log('未登入，顯示空書櫃');
                    this.message.info('請先登入以查看您的書櫃');
                    this.purchasedBooks = [];
                }
                // 如果是其他錯誤 (例如伺服器未開啟，status可能為0或500)，則視為離線或伺服器問題
                else {
                    
                    this.isLoggedIn = false;
                    //console.error("無法連線至後端，啟用前端備援資料:", err);
                    this.message.warning('無法連線至伺服器，目前顯示為離線書櫃');
                    this.purchasedBooks = this.fakePurchasedBooks;
                }
                this.filterBooks();
            }
        });
    }
    

    filterBooks(): void {
        if (!this.searchText) {
            this.filteredBooks = this.purchasedBooks;
        } else {
            this.filteredBooks = this.purchasedBooks.filter(book =>
                book.ebookName.toLowerCase().includes(this.searchText.toLowerCase()) ||
                book.author.toLowerCase().includes(this.searchText.toLowerCase())
            );
        }
    }

    isReadable(book: PurchasedBookDto): boolean {
        return book.isReadable;
    }

    toNumber(value: string | null): number {
        return Number(value) || 0;
    }
}
