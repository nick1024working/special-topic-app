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

interface Category {
    id: number;
    name: string;
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

    constructor(
        private cartService: CartService,
        private ebookService: EbookService
    ) { }

    private allBooks: EBookSummaryDto[] = [];
    public filteredBooks: EBookSummaryDto[] = [];
    public paginatedBooks: EBookSummaryDto[] = [];

    public categories: Category[] = [];
    public hotTags: string[] = [];

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
                    return of({ items: [], totalCount: 0 });
                })
            ),
        }).subscribe(({ backendBooks }) => {
            console.log("從後端取得的書籍數量:", backendBooks.items.length); // 加上日誌方便偵錯
            this.allBooks = [...backendBooks.items, ...BOOKS_DATA];

            this.generateCategories();
            this.generateHotTags();
            this.applyFiltersAndPaginate();

            this.isLoading = false;
        });
    }

    generateCategories(): void {
        // [修改] 使用 Set 來取得不重複的分類名稱，並過濾掉空值
        const categoryNames = new Set(this.allBooks
            .map(book => book.categoryName)
            .filter(name => name && name.trim() !== '')); // 確保分類名稱有效

        const dynamicCategories = Array.from(categoryNames).map((name, index) => ({
            id: index + 1,
            name: name!
        }));

        // [修改] 先建立動態分類，再加入「所有分類」，確保不重複
        this.categories = [{ id: 0, name: '所有分類' }, ...dynamicCategories];
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

        this.hotTags = Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(entry => entry[0]);
    }

    applyFiltersAndPaginate(): void {
        let booksToFilter = [...this.allBooks];

        if (this.searchText.trim() !== '') {
            const query = this.searchText.toLowerCase();
            booksToFilter = booksToFilter.filter(book =>
                book.ebookName.toLowerCase().includes(query) ||
                (book.author && book.author.toLowerCase().includes(query))
            );
        }

        if (this.selectedCategory > 0) {
            const selectedCategoryName = this.categories.find(c => c.id === this.selectedCategory)?.name;
            if (selectedCategoryName) {
                booksToFilter = booksToFilter.filter(book => book.categoryName === selectedCategoryName);
            }
        }

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

    shuffleTags(): void {
        this.generateHotTags();
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
