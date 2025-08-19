// 檔案路徑: src/app/features/ebook/book-list/book-list.component.ts

import { Component, OnInit } from '@angular/core';
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
import { NzAlertModule } from 'ng-zorro-antd/alert'; // [新增] 匯入 NzAlertModule

import { CartService } from '../services/cart.service';
import { EbookService } from '../services/ebook.service';
import { EBookSummaryDto } from '../DTOs/ebook-summary.dto';
import { BOOKS_DATA } from './books.data';

@Component({
    selector: 'app-book-list',
    standalone: true,
    imports: [
        CommonModule, RouterModule, FormsModule, NzCardModule, NzGridModule,
        NzButtonModule, NzIconModule, NzInputModule, NzTagModule,
        NzPaginationModule,
        NzAlertModule // [新增] 將 NzAlertModule 加入 imports
    ],
    templateUrl: './book-list.component.html',
    styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

    // [修改] 移除 NzMessageService，注入需要的服務即可
    constructor(
        private cartService: CartService,
        private ebookService: EbookService
    ) { }

    // [新增] 用於控制 alert 提示框的屬性
    isAlertVisible = false;
    alertMessage = '';
    private alertTimeout: any;

    // --- 既有屬性 (無變動) ---
    currentPage = 1;
    pageSize = 8;
    totalItems = 0;
    paginatedBooks: EBookSummaryDto[] = [];
    private realTotalCount = 0;
    private realTotalPages = 0;
    searchText = '';
    selectedCategory = 1;
    private filteredLocalBooks: EBookSummaryDto[] = [];
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

    // [重大修改] 改為呼叫我們自訂的 showAlert 方法
    addToCart(book: EBookSummaryDto): void {
        this.cartService.addToCart(book);
        this.showAlert(`《${book.ebookName}》已成功加入購物車`);
    }

    // [新增] 手動顯示/隱藏提示框的方法
    private showAlert(message: string, duration: number = 2500): void {
        // 如果已有計時器正在執行，先清除
        if (this.alertTimeout) {
            clearTimeout(this.alertTimeout);
        }

        this.alertMessage = message;
        this.isAlertVisible = true;

        // 設定一個計時器，在指定時間後隱藏提示框
        this.alertTimeout = setTimeout(() => {
            this.isAlertVisible = false;
        }, duration);
    }

    // --- 以下方法無須變動 ---
    initialLoad(): void {
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
                this.totalItems = BOOKS_DATA.length;
                this.loadBooksForPage(1);
            }
        });
    }
    search(): void {
        const query = this.searchText.trim().toLowerCase();
        if (!query) {
            this.initialLoad();
            return;
        }
        this.isSearchActive = true;
        this.currentPage = 1;
        this.filteredLocalBooks = BOOKS_DATA.filter(book =>
            book.ebookName.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        ) as EBookSummaryDto[];
        this.ebookService.getEbooks(1, this.pageSize, this.searchText).subscribe(response => {
            this.realTotalCount = response.totalCount;
            this.totalItems = this.realTotalCount + this.filteredLocalBooks.length;
            this.realTotalPages = Math.ceil(this.realTotalCount / this.pageSize);
            this.loadBooksForPage(1);
        });
    }
    loadBooksForPage(page: number): void {
        this.currentPage = page;
        if (!this.isSearchActive) {
            this.loadBooksInNormalMode();
        } else {
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
                error: (err) => { 
                    /* 這裡原本的 this.message.error 也拿掉，避免報錯 */
                    console.error("載入書籍失敗！", err);
                }
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
        if (startIndex + this.pageSize <= this.realTotalCount) {
            this.ebookService.getEbooks(this.currentPage, this.pageSize, this.searchText).subscribe(response => {
                this.paginatedBooks = response.items;
            });
        }
        else if (startIndex >= this.realTotalCount) {
            const localStartIndex = startIndex - this.realTotalCount;
            const localEndIndex = localStartIndex + this.pageSize;
            this.paginatedBooks = this.filteredLocalBooks.slice(localStartIndex, localEndIndex);
        }
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