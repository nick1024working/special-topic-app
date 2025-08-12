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

    // [補上] 為分類下拉選單準備的假資料
    categories = [
        { id: 1, name: '所有分類' },
        { id: 2, name: '文學小說' },
        { id: 3, name: '商業理財' },
        { id: 4, name: '心理勵志' },
        { id: 5, name: '電腦資訊' },
    ];

    // [補上] 為熱門標籤準備的假資料
    hotTags = ['王道', '升級', '戀愛', '無敵', '龍傲天'];

    ngOnInit(): void {
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

    loadBooksForPage(page: number): void {
        this.currentPage = page;

        if (this.currentPage <= this.realTotalPages) {
            console.log(`正在從 API 載入第 ${this.currentPage} 頁的真實資料...`);
            this.ebookService.getEbooks(this.currentPage, this.pageSize, this.searchText).subscribe({
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
            console.log(`正在從本地載入第 ${this.currentPage} 頁的假資料...`);
            this.loadFakeBooksForPage();
        }
    }

    loadFakeBooksForPage(): void {
        const overallStartIndex = (this.currentPage - 1) * this.pageSize;
        const fakeDataStartIndex = overallStartIndex - this.realTotalCount;
        const fakeDataEndIndex = fakeDataStartIndex + this.pageSize;
        this.paginatedBooks = BOOKS_DATA.slice(fakeDataStartIndex, fakeDataEndIndex) as EBookSummaryDto[];
    }

    onPageChange(page: any): void {
        this.loadBooksForPage(page);
    }

    search(): void {
        this.ebookService.getEbooks(1, this.pageSize, this.searchText).subscribe(response => {
            this.paginatedBooks = response.items;
            this.totalItems = response.totalCount;
            this.currentPage = 1;
        });
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
}
