// 檔案路徑: src/app/features/ebook/book-list/book-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CartService } from '../services/cart.service';
import { EbookService } from '../services/ebook.service';
import { EBookSummaryDto } from '../DTOs/ebook-summary.dto';
import { BOOKS_DATA } from './books.data';

@Component({
    selector: 'app-book-list',
    standalone: true,
    imports: [
        CommonModule, RouterModule, FormsModule, NzCardModule, NzGridModule,
        NzButtonModule, NzMessageModule, NzIconModule, NzInputModule, NzTagModule,
        NzPaginationModule
    ],
    templateUrl: './book-list.component.html',
    styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

    constructor(
        private message: NzMessageService,
        private cartService: CartService,
        private ebookService: EbookService
    ) { }

    // --- 屬性定義 ---
    currentPage = 1;
    pageSize = 8;
    totalItems = 0;
    paginatedBooks: EBookSummaryDto[] = [];

    private realTotalCount = 0;
    private realTotalPages = 0;

    searchText = '';
    selectedCategory = 1;

    // [新增] 用於儲存篩選後的本地假資料
    private filteredLocalBooks: EBookSummaryDto[] = [];
    // [新增] 用於判斷當前是否處於搜尋模式
    private isSearchActive = false;


    categories = [
        { id: 1, name: '所有分類' },
        { id: 2, name: '文學小說' },
        { id: 3, name: '商業理財' },
        { id: 4, name: '心理勵志' },
        { id: 5, name: '電腦資訊' },
    ];

    hotTags = ['王道', '升級', '戀愛', '無敵', '龍傲天'];

    ngOnInit(): void {
        this.initialLoad();
    }

    initialLoad(): void {
        // [修改] 增加重置搜尋狀態的邏輯
        this.isSearchActive = false;
        this.searchText = '';
        this.filteredLocalBooks = [];

        this.ebookService.getEbooks(1, 1).subscribe({
            next: (response) => {
                this.realTotalCount = response.totalCount;
                this.realTotalPages = Math.ceil(this.realTotalCount / this.pageSize);
                this.totalItems = this.realTotalCount + BOOKS_DATA.length;
                this.loadBooksForPage(1);
            },
            error: (err) => {
                console.error("初始化 API 呼叫失敗，完全使用本地資料:", err);
                this.realTotalCount = 0;
                this.realTotalPages = 0;
                this.totalItems = BOOKS_DATA.length;
                this.loadBooksForPage(1);
            }
        });
    }

    // [修改] search 方法，加入本地資料篩選邏輯
    search(): void {
        const query = this.searchText.trim().toLowerCase();

        // 如果搜尋為空，則還原列表
        if (!query) {
            this.initialLoad();
            return;
        }

        this.isSearchActive = true;
        this.currentPage = 1;

        // 1. 篩選本地假資料
        this.filteredLocalBooks = BOOKS_DATA.filter(book =>
            book.ebookName.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        ) as EBookSummaryDto[];

        // 2. 搜尋後端資料
        this.ebookService.getEbooks(1, this.pageSize, this.searchText).subscribe(response => {
            // 3. 合併總數
            this.realTotalCount = response.totalCount; // 更新後端搜尋結果的總數
            this.totalItems = this.realTotalCount + this.filteredLocalBooks.length;
            this.realTotalPages = Math.ceil(this.realTotalCount / this.pageSize);

            // 4. 載入第一頁的合併結果
            this.loadBooksForPage(1);
        });
    }

    // [重大修改] 分頁邏輯，需區分「正常模式」與「搜尋模式」
    loadBooksForPage(page: number): void {
        this.currentPage = page;

        if (!this.isSearchActive) {
            // --- 正常模式 (原始邏輯) ---
            this.loadBooksInNormalMode();
        } else {
            // --- 搜尋模式 (新邏輯) ---
            this.loadBooksInSearchMode();
        }
    }

    private loadBooksInNormalMode(): void {
        if (this.currentPage <= this.realTotalPages) {
            this.ebookService.getEbooks(this.currentPage, this.pageSize).subscribe({
                next: (response) => {
                    let items = response.items;
                    if (items.length < this.pageSize && this.currentPage === this.realTotalPages) {
                        const needed = this.pageSize - items.length;
                        const fakeItemsToFill = BOOKS_DATA.slice(0, needed);
                        this.paginatedBooks = items.concat(fakeItemsToFill as EBookSummaryDto[]);
                    } else {
                        this.paginatedBooks = items;
                    }
                },
                error: (err) => { this.message.error("載入書籍失敗！"); }
            });
        } else {
            const overallStartIndex = (this.currentPage - 1) * this.pageSize;
            const fakeDataStartIndex = overallStartIndex - this.realTotalCount;
            const fakeDataEndIndex = fakeDataStartIndex + this.pageSize;
            this.paginatedBooks = BOOKS_DATA.slice(fakeDataStartIndex, fakeDataEndIndex) as EBookSummaryDto[];
        }
    }

    private loadBooksInSearchMode(): void {
        const startIndex = (this.currentPage - 1) * this.pageSize;

        // 情況 1: 該頁完全落在後端資料範圍內
        if (startIndex + this.pageSize <= this.realTotalCount) {
            this.ebookService.getEbooks(this.currentPage, this.pageSize, this.searchText).subscribe(response => {
                this.paginatedBooks = response.items;
            });
        }
        // 情況 2: 該頁完全落在前端假資料範圍內
        else if (startIndex >= this.realTotalCount) {
            const localStartIndex = startIndex - this.realTotalCount;
            const localEndIndex = localStartIndex + this.pageSize;
            this.paginatedBooks = this.filteredLocalBooks.slice(localStartIndex, localEndIndex);
        }
        // 情況 3: 該頁橫跨後端與前端資料 (最複雜的情況)
        else {
            this.ebookService.getEbooks(this.currentPage, this.pageSize, this.searchText).subscribe(response => {
                const apiItems = response.items;
                const neededFromLocal = this.pageSize - apiItems.length;
                if (neededFromLocal > 0) {
                    const localItemsToFill = this.filteredLocalBooks.slice(0, neededFromLocal);
                    this.paginatedBooks = apiItems.concat(localItemsToFill);
                } else {
                    this.paginatedBooks = apiItems;
                }
            });
        }
    }

    onPageChange(page: number): void {
        this.loadBooksForPage(page);
    }

    addToCart(book: any): void {
        this.message.success(book.ebookName + ' 已成功加入購物車!');
        this.cartService.addToCart();
    }

    shuffleTags(): void {
        for (let i = this.hotTags.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.hotTags[i], this.hotTags[j]] = [this.hotTags[j], this.hotTags[i]];
        }
    }

    isReadable(book: { isReadable: boolean }): boolean {
        return book.isReadable;
    }
}
