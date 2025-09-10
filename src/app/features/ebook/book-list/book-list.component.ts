// 檔案路徑: src/app/features/ebook/book-list/book-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { EbookService } from '../services/ebook.service';
import { EBookSummaryDto } from '../DTOs/ebook-summary.dto';
import { BOOKS_DATA } from './books.data';
import { HierarchicalCategoryDto } from '../DTOs/category.dto';

import { CartService } from 'app/shared/services/cart.service';

// [新增] 引入 DTO 與 Sidebar API
import { UpsertCartItemRequest } from 'app/shared/dtos/upsert-cart-item-request.dto';
import { CartSidebarApi } from 'app/shared/components/cart-sidebar/cart-sidebar.api';

// 這個 interface 已經被 DTO 取代，可以移除
// interface Category {
//     id: number;
//     name: string;
// }

// [新增] 定義價格區間的結構
interface PriceRange {
    value: string; // 用於 ngModel 綁定
    label: string; // 顯示在下拉選單的文字
    min: number;
    max: number;
}

@Component({
    selector: 'app-book-list',
    standalone: true,
    imports: [
        CommonModule, RouterModule, FormsModule, NzCardModule, NzGridModule,
        NzButtonModule, NzIconModule, NzInputModule, NzTagModule,
        NzPaginationModule, NzAlertModule
    ],
    templateUrl: './book-list.component.html',
    styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {


    // 【步驟 2】使用 inject 注入需要的服務
    private readonly route = inject(ActivatedRoute);






    // [新增] 價格區間的選項
    public priceRanges: PriceRange[] = [
        { value: 'all', label: '所有價格', min: 0, max: Infinity },
        { value: '0-100', label: '$100 以下', min: 0, max: 100 },
        { value: '101-300', label: '$101 - $300', min: 101, max: 300 },
        { value: '301-500', label: '$301 - $500', min: 301, max: 500 },
        { value: '501-1000', label: '$501 - $1000', min: 501, max: 1000 }, // [修改]
        { value: '1001+', label: '$1001 以上', min: 1001, max: Infinity }   // [新增]
    ];

    // [新增] 用於綁定當前選中的價格區間
    public selectedPriceRange = 'all';

    constructor(
        private cartSvc: CartService,
        private ebookService: EbookService,
        private cartSidebarApi: CartSidebarApi, // [修改] 在此注入 SideBar API
        private router: Router // <-- router 保留在 constructor 中是常見做法，也可改用 inject
    ) { }

    private allBooks: EBookSummaryDto[] = [];
    public filteredBooks: EBookSummaryDto[] = [];
    public paginatedBooks: EBookSummaryDto[] = [];

    public categories: HierarchicalCategoryDto[] = [];
    public hotTags: string[] = [];

    // --- [新增] 宣告遺漏的 allUniqueTags 屬性 ---
    private allUniqueTags: string[] = [];

    public searchText = '';
    public selectedCategory = 0;
    public currentPage = 1;
    public pageSize = 8;
    public totalItems = 0;

    public isLoading = true;
    public isAlertVisible = false;
    public alertMessage = '';
    private alertTimeout: any;

    ngOnInit(): void {

        this.handlePaymentReturn();

        // 1. 檢查載入頁面時，URL 是否從別處帶來了 search 參數
        const initialSearchTerm = this.route.snapshot.queryParamMap.get('search');

        // 2. 如果有 search 參數 (代表是從詳細頁的標籤點擊過來的)
        if (initialSearchTerm) {
            // 完全模擬 onTagClick 的行為
            this.selectedCategory = 0;
            this.searchText = initialSearchTerm;

            // (建議) 清除 URL 上的查詢參數，避免使用者重整頁面時篩選條件還在
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { search: null },
                queryParamsHandling: 'merge', // 保留其他可能的參數
                replaceUrl: true // 不在瀏覽器歷史紀錄中留下這次導航
            });
        }
        this.loadInitialData();
    }


    // 【步驟 4】建立一個獨立的方法來處理清空邏輯，讓 ngOnInit 更乾淨
    private handlePaymentReturn(): void {
        const orderId = sessionStorage.getItem('ecpay_order_id');
        // 檢查 sessionStorage 中是否有我們存的「暗號」
        if (orderId) {
            console.log(`檢測到從 ECPay 返回，訂單 ID: ${orderId}，準備清空購物車...`);



            // 呼叫服務來清空電子書的購物車
            this.cartSvc.clearCart().subscribe({
                next: () => {
                    console.log('電子書購物車已清空。');
                    // 立刻移除暗號，避免使用者重整頁面時重複觸發
                    sessionStorage.removeItem('ecpay_order_id');
                    this.cartSidebarApi.show(); // 更新右上角購物車圖示的數字

                },
                error: (err) => {
                    console.error('清空購物車時發生錯誤', err);

                }
            });
        }
    }

    loadInitialData(): void {
        this.isLoading = true;

        forkJoin({
            backendBooks: this.ebookService.getEbooks(1, 9999).pipe(
                catchError(err => {
                    console.error("載入後端書籍失敗，請檢查後端 API 是否正常運作:", err);
                    return of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 9999, totalPages: 1 });
                })
            ),
            // 同時也去後端取得階層式分類
            backendCategories: this.ebookService.getCategories().pipe(
                catchError(err => {
                    console.error("載入後端分類失敗:", err);
                    return of([]); // 失敗時回傳空陣列
                })
            )
        }).subscribe(({ backendBooks, backendCategories }) => {
            // 1. 合併所有書籍資料
            this.allBooks = [...backendBooks.items, ...BOOKS_DATA];

            // 2. 處理分類
            this.mergeCategories(backendCategories);

            this.initializeHotTags(); // <-- [修改] 呼叫新的初始化方法

            // 3. 處理熱門標籤 (這部分邏輯不變，它本來就是根據 allBooks 產生)
            // this.generateHotTags();

            // 4. 應用預設篩選並分頁
            this.applyFiltersAndPaginate();

            this.isLoading = false;
        });
    }

    // [重大修改] 頁面首次載入時，計算並顯示最熱門的標籤
    initializeHotTags(): void {
        // 1. 取得所有書籍的所有標籤
        const allLabels = this.allBooks.flatMap(book => book.labels || []);

        // 2. 計算每個標籤出現的次數
        const tagCounts = allLabels.reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        // 3. 根據出現次數由高到低排序，並儲存所有不重複的標籤
        this.allUniqueTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

        // 4. 將最熱門的前 5 個標籤設定為 hotTags，用於初次顯示
        this.hotTags = this.allUniqueTags.slice(0, 5);
    }

    // [新增] 計算折扣的函式
    calculateDiscount(fixedPrice: number, actualPrice: number): string {
        if (!actualPrice || actualPrice <= 0 || actualPrice >= fixedPrice) {
            return ''; // 如果沒有特價或特價無效，則不顯示
        }
        // 計算折扣，例如 250 / 330 * 10 = 7.57...
        const discountFactor = (actualPrice / fixedPrice) * 10;

        // 將結果格式化為一位小數，並移除結尾的 .0 (例如 8.0 -> 8)
        const formattedDiscount = discountFactor.toFixed(1).replace(/\.0$/, '');

        return `${formattedDiscount}折`;
    }

    // [重大修改] 取代舊的 loadCategories，改為合併邏輯
    mergeCategories(backendCategories: HierarchicalCategoryDto[]): void {
        const finalCategories = [...backendCategories];

        // 建立一個查找表，方便快速檢查分類是否存在
        const existingCategoryNames = new Set<string>();
        backendCategories.forEach(parent => {
            existingCategoryNames.add(parent.name);
            parent.children.forEach(child => {
                existingCategoryNames.add(child.name);
            });
        });

        // 遍歷前端假資料，找出所有獨特的分類
        const fakeCategoryNames = new Set(BOOKS_DATA.map(book => book.categoryName).filter(Boolean));

        // 將假資料中獨有的分類，加到最終列表的尾端
        fakeCategoryNames.forEach(fakeName => {
            if (!existingCategoryNames.has(fakeName!)) {
                finalCategories.push({
                    id: 9000 + finalCategories.length, // 給一個臨時的大 ID
                    name: fakeName!,
                    children: [] // 假資料的分類沒有子分類
                });
            }
        });

        this.categories = finalCategories;
    }

    onTagClick(tag: string): void {
        // [修改] 在搜尋前，先將分類下拉選單重置為「所有分類」
        this.selectedCategory = 0;


        this.searchText = tag;
        this.applyFiltersAndPaginate();
    }

    generateCategories(): void {
        const categoryNames = new Set(this.allBooks
            .map(book => book.categoryName)
            .filter(name => name && name.trim() !== ''));

        // [修改] 讓產生的物件符合 HierarchicalCategoryDto 的結構
        const dynamicCategories: HierarchicalCategoryDto[] = Array.from(categoryNames).map((name, index) => ({
            id: index + 1,
            name: name!,
            children: [] // 加上必要的 children 屬性 (即使是空的)
        }));

        // [修改] 「所有分類」物件也必須符合 HierarchicalCategoryDto 的結構
        this.categories = [{ id: 0, name: '所有分類', children: [] }, ...dynamicCategories];
    }

    generateHotTags(count: number = 5): void {
        const tagCounts = new Map<string, number>();
        this.allBooks.forEach(book => {
            if (book.labels && book.labels.length > 0) {
                book.labels.forEach(label => {
                    tagCounts.set(label, (tagCounts.get(label) || 0) + 1);
                });
            }
        });

        this.allUniqueTags = Array.from(tagCounts.keys());

        this.hotTags = Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(entry => entry[0]);
    }

    shuffleTags(): void {
        if (this.allUniqueTags.length <= 5) {
            return;
        }

        for (let i = this.allUniqueTags.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.allUniqueTags[i], this.allUniqueTags[j]] = [this.allUniqueTags[j], this.allUniqueTags[i]];
        }

        this.hotTags = this.allUniqueTags.slice(0, 5);
    }

    // applyFiltersAndPaginate(): void {
    //     let booksToFilter = [...this.allBooks];

    //     if (this.searchText.trim() !== '') {
    //         const query = this.searchText.toLowerCase();
    //         booksToFilter = booksToFilter.filter(book =>
    //             // 條件一：書名包含關鍵字
    //             book.ebookName.toLowerCase().includes(query) ||
    //             // 條件二：作者包含關鍵字
    //             (book.author && book.author.toLowerCase().includes(query)) ||
    //             // [新增] 條件三：書本的標籤列表中，有任何一個標籤包含關鍵字
    //             (book.labels && book.labels.some(label => label.toLowerCase().includes(query)))
    //         );
    //     }

    //     if (this.selectedCategory > 0) {
    //         // 因為我們是從扁平資料產生分類，所以直接比對 name 即可
    //         const selectedCategoryName = this.categories.find(c => c.id === this.selectedCategory)?.name;
    //         if (selectedCategoryName) {
    //             booksToFilter = booksToFilter.filter(book => book.categoryName === selectedCategoryName);
    //         }
    //     }

    //     this.filteredBooks = booksToFilter;
    //     this.totalItems = this.filteredBooks.length;

    //     this.currentPage = 1;
    //     this.paginateBooks();
    // }

    // [修改] 由於我們又回到客戶端篩選，所以需要還原這個版本的 loadBooks
    loadBooks(): void {
        this.paginateBooks();
    }


    // [核心修正] applyFiltersAndPaginate 的邏輯
    applyFiltersAndPaginate(): void {
        let booksToFilter = [...this.allBooks];

        // 1. 搜尋文字篩選 (此部分邏輯不變)
        if (this.searchText.trim() !== '') {
            const query = this.searchText.toLowerCase();
            booksToFilter = booksToFilter.filter(book =>
                book.ebookName.toLowerCase().includes(query) ||
                (book.author && book.author.toLowerCase().includes(query)) ||
                (book.labels && book.labels.some(label => label.toLowerCase().includes(query)))
            );
        }

        // 2. [BUG 修正] 分類篩選邏輯，改用 CategoryId
        if (this.selectedCategory > 0) {
            // 檢查選中的 ID 是否為一個父分類 (且其下有子分類)
            const selectedParent = this.categories.find(p => p.id === this.selectedCategory && p.children.length > 0);

            if (selectedParent) {
                // --- 情況一：如果選中的是父分類 (例如 "漫畫 (全部)") ---
                // 建立一個要比對的 ID 列表，包含父分類本身和它所有子分類的 ID
                const categoryIdsToMatch = [selectedParent.id, ...selectedParent.children.map(c => c.id)];

                booksToFilter = booksToFilter.filter(book =>
                    // 書籍的 categoryId 必須存在於我們的比對列表中
                    book.categoryId && categoryIdsToMatch.includes(book.categoryId)
                );

            } else {
                // --- 情況二：如果選中的是子分類 (例如 "愛情") 或沒有子分類的分類 ---
                // 直接比對書籍的 categoryId 是否與選中的 ID 完全相符
                booksToFilter = booksToFilter.filter(book => book.categoryId === this.selectedCategory);
            }
        }

        // 3. 價格區間篩選 (此部分邏輯不變)
        if (this.selectedPriceRange !== 'all') {
            const range = this.priceRanges.find(r => r.value === this.selectedPriceRange);
            if (range) {
                booksToFilter = booksToFilter.filter(book => {
                    const price = book.actualPrice ?? book.fixedPrice;
                    return price >= range.min && price <= range.max;
                });
            }
        }

        // 4. 更新列表並分頁 (此部分邏輯不變)
        this.filteredBooks = booksToFilter;
        this.totalItems = this.filteredBooks.length;
        this.currentPage = 1;
        this.paginateBooks();
    }

    // [還原] applyFiltersAndPaginate 的邏輯
    // applyFiltersAndPaginate(): void {
    //     let booksToFilter = [...this.allBooks];

    //     if (this.searchText.trim() !== '') {
    //         const query = this.searchText.toLowerCase();
    //         booksToFilter = booksToFilter.filter(book =>
    //             book.ebookName.toLowerCase().includes(query) ||
    //             (book.author && book.author.toLowerCase().includes(query)) ||
    //             (book.labels && book.labels.some(label => label.toLowerCase().includes(query)))
    //         );
    //     }

    //     // [修改] 篩選邏輯需要同時考慮父分類和子分類
    //     if (this.selectedCategory > 0) {
    //         const selectedParent = this.categories.find(c => c.id === this.selectedCategory);

    //         if (selectedParent) {
    //             // 如果選中的是父分類，且底下有子分類
    //             if (selectedParent.children && selectedParent.children.length > 0) {
    //                 const childCategoryNames = selectedParent.children.map(c => c.name);
    //                 booksToFilter = booksToFilter.filter(book =>
    //                     book.categoryName === selectedParent.name || childCategoryNames.includes(book.categoryName!)
    //                 );
    //             } else { // 如果選中的是子分類或沒有子分類的父分類
    //                 booksToFilter = booksToFilter.filter(book => book.categoryName === selectedParent.name);
    //             }
    //         } else { // 處理選中的是子分類的情況
    //             let selectedChildName: string | undefined;
    //             for (const parent of this.categories) {
    //                 const foundChild = parent.children.find(c => c.id === this.selectedCategory);
    //                 if (foundChild) {
    //                     selectedChildName = foundChild.name;
    //                     break;
    //                 }
    //             }
    //             if (selectedChildName) {
    //                 booksToFilter = booksToFilter.filter(book => book.categoryName === selectedChildName);
    //             }
    //         }
    //     }

    //     --- [新增] 價格區間篩選邏輯 ---
    //     if (this.selectedPriceRange !== 'all') {
    //         const range = this.priceRanges.find(r => r.value === this.selectedPriceRange);
    //         if (range) {
    //             booksToFilter = booksToFilter.filter(book => {
    //                 // 優先使用 actualPrice，如果沒有則用 fixedPrice
    //                 const price = book.actualPrice ?? book.fixedPrice;
    //                 return price >= range.min && price <= range.max;
    //             });
    //         }
    //     }
    //     --- [新增結束] ---

    //     this.filteredBooks = booksToFilter;
    //     this.totalItems = this.filteredBooks.length;

    //     this.currentPage = 1;
    //     this.paginateBooks();
    // }

    paginateBooks(): void {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedBooks = this.filteredBooks.slice(startIndex, endIndex);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.paginateBooks();
    }

    // addToCart(book: EBookSummaryDto): void {
    //     // this.cartService.addToCart(book);
    //     // this.showAlert(`《${book.ebookName}》已成功加入購物車`);

    //     this.cartSvc.upsertItem(req).subscribe({
    //         next: () => this.pushCarts()
    //     });


    // }

    // [重大修改] 完整改寫 addToCart 方法
    addToCart(book: EBookSummaryDto): void {
        // 1. 根據 DTO 格式，建立請求物件
        const req: UpsertCartItemRequest = {
            productProvider: 'EBook', // 因為這裡是電子書列表，所以直接指定為 'EBook'
            id: book.ebookId.toString(),              // 請確保 EBookSummaryDto 中有 'id' 屬性
            name: book.ebookName,
            imageUrl: book.primaryCoverPath ?? 'https://dummyimage.com/350x500/cccccc/000.png&text=No+Image', // 請確保 EBookSummaryDto 中有 'coverImageUrl' 屬性
            unitPrice: book.actualPrice ?? book.fixedPrice, // 優先使用實際售價
            quantity: 1               // 每次點擊都是新增一本
        };

        // 2. 呼叫 CartService 的 upsertItem
        this.cartSvc.upsertItem(req).subscribe({
            next: () => {
                // 3. 成功後，顯示提示訊息
                this.showAlert(`《${book.ebookName}》已成功加入購物車`);
                // 4. 呼叫 sidebar API 的 show() 方法，它會負責展開並刷新購物車
                this.cartSidebarApi.show();
            },
            error: (err) => {
                console.error('加入購物車失敗:', err);
                this.showAlert('加入購物車失敗，請稍後再試');
            }
        });
    }

    private showAlert(message: string, duration: number = 2500): void {
        if (this.alertTimeout) clearTimeout(this.alertTimeout);
        this.alertMessage = message;
        this.isAlertVisible = true;
        this.alertTimeout = setTimeout(() => { this.isAlertVisible = false; }, duration);
    }
}
