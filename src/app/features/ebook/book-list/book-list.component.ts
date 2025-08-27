// 檔案路徑: src/app/features/ebook/book-list/book-list.component.ts
import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { CartService } from '../services/cart.service';
import { EbookService } from '../services/ebook.service';
import { EBookSummaryDto } from '../DTOs/ebook-summary.dto';
import { BOOKS_DATA } from './books.data';
import { HierarchicalCategoryDto } from '../DTOs/category.dto';

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

    // [新增] 價格區間的選項
    public priceRanges: PriceRange[] = [
        { value: 'all', label: '所有價格', min: 0, max: Infinity },
        { value: '0-100', label: '$100 以下', min: 0, max: 100 },
        { value: '101-300', label: '$101 - $300', min: 101, max: 300 },
        { value: '301-500', label: '$301 - $500', min: 301, max: 500 },
        { value: '501+', label: '$501 以上', min: 501, max: Infinity }
    ];

    // [新增] 用於綁定當前選中的價格區間
    public selectedPriceRange = 'all';

    constructor(
        private cartService: CartService,
        private ebookService: EbookService
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
        this.loadInitialData();
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

            // 3. 處理熱門標籤 (這部分邏輯不變，它本來就是根據 allBooks 產生)
            this.generateHotTags();

            // 4. 應用預設篩選並分頁
            this.applyFiltersAndPaginate();

            this.isLoading = false;
        });
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

    // [還原] applyFiltersAndPaginate 的邏輯
    applyFiltersAndPaginate(): void {
        let booksToFilter = [...this.allBooks];

        if (this.searchText.trim() !== '') {
            const query = this.searchText.toLowerCase();
            booksToFilter = booksToFilter.filter(book =>
                book.ebookName.toLowerCase().includes(query) ||
                (book.author && book.author.toLowerCase().includes(query)) ||
                (book.labels && book.labels.some(label => label.toLowerCase().includes(query)))
            );
        }

        // [修改] 篩選邏輯需要同時考慮父分類和子分類
        if (this.selectedCategory > 0) {
            const selectedParent = this.categories.find(c => c.id === this.selectedCategory);

            if (selectedParent) {
                // 如果選中的是父分類，且底下有子分類
                if (selectedParent.children && selectedParent.children.length > 0) {
                    const childCategoryNames = selectedParent.children.map(c => c.name);
                    booksToFilter = booksToFilter.filter(book =>
                        book.categoryName === selectedParent.name || childCategoryNames.includes(book.categoryName!)
                    );
                } else { // 如果選中的是子分類或沒有子分類的父分類
                    booksToFilter = booksToFilter.filter(book => book.categoryName === selectedParent.name);
                }
            } else { // 處理選中的是子分類的情況
                let selectedChildName: string | undefined;
                for (const parent of this.categories) {
                    const foundChild = parent.children.find(c => c.id === this.selectedCategory);
                    if (foundChild) {
                        selectedChildName = foundChild.name;
                        break;
                    }
                }
                if (selectedChildName) {
                    booksToFilter = booksToFilter.filter(book => book.categoryName === selectedChildName);
                }
            }
        }

        // --- [新增] 價格區間篩選邏輯 ---
        if (this.selectedPriceRange !== 'all') {
            const range = this.priceRanges.find(r => r.value === this.selectedPriceRange);
            if (range) {
                booksToFilter = booksToFilter.filter(book => {
                    // 優先使用 actualPrice，如果沒有則用 fixedPrice
                    const price = book.actualPrice ?? book.fixedPrice;
                    return price >= range.min && price <= range.max;
                });
            }
        }
        // --- [新增結束] ---

        this.filteredBooks = booksToFilter;
        this.totalItems = this.filteredBooks.length;

        this.currentPage = 1;
        this.paginateBooks();
    }

    paginateBooks(): void {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedBooks = this.filteredBooks.slice(startIndex, endIndex);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.paginateBooks();
    }

    addToCart(book: EBookSummaryDto): void {
        this.cartService.addToCart(book);
        this.showAlert(`《${book.ebookName}》已成功加入購物車`);
    }

    private showAlert(message: string, duration: number = 2500): void {
        if (this.alertTimeout) clearTimeout(this.alertTimeout);
        this.alertMessage = message;
        this.isAlertVisible = true;
        this.alertTimeout = setTimeout(() => { this.isAlertVisible = false; }, duration);
    }
}
