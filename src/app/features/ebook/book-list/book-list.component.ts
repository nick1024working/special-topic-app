import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CartService } from '../services/cart.service';
import { RouterModule } from '@angular/router';
import { BOOKS_DATA } from './books.data'; // [新增] 匯入共用資料
import { FormsModule } from '@angular/forms'; // 處理 [(ngModel)] 雙向綁定
import { NzInputModule } from 'ng-zorro-antd/input';   // 搜尋框模組
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
// ... 其他 import ...
import { EbookService } from '../services/ebook.service'; // [新增]
import { EBookSummaryDto } from '../DTOs/ebook-summary.dto'; // [新增]


@Component({
    selector: 'app-book-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule, // [新增]
        NzCardModule,
        NzGridModule,
        NzButtonModule,
        NzMessageModule,
        NzIconModule,
        RouterModule,
        NzInputModule,   // [新增]
        NzTagModule, // [新增] 加入這一行
        NzPaginationModule

    ],
    templateUrl: './book-list.component.html',
    styleUrls: ['./book-list.component.css']
})
export class BookListComponent {

    constructor(
        private message: NzMessageService,
        private cartService: CartService,
        private ebookService: EbookService // <-- [新增]
    ) { }

    // --- [新增] 分頁相關屬性 ---
    currentPage = 1;
    pageSize = 8; // 設定一頁顯示 8 本書
    totalItems = BOOKS_DATA.length;
    paginatedBooks: any[] = []; // 用來存放當前頁面要顯示的書籍

    searchText = '';
    selectedCategory = 1;

    categories = [
        { id: 1, name: '所有分類' },
        { id: 2, name: '文學小說' },
        { id: 3, name: '商業理財' },
        { id: 4, name: '心理勵志' },
        { id: 5, name: '電腦資訊' },
    ];

    // [新增] 為熱門標籤準備的假資料
    hotTags = ['王道', '升級', '戀愛', '無敵', '龍傲天']; // 註：我將「傲天」修正為更常見的「龍傲天」

    // --- [新增] 處理分頁變更的函式 ---
    paginateBooks(): void {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedBooks = this.books.slice(startIndex, endIndex);
    }

    // --- [修改] 讓頁碼變動時，重新計算要顯示的書籍 ---
    onPageChange(page: number): void {
        console.log('Current page index is:', page);
        this.currentPage = page;
        this.paginateBooks();
    }

    // [修改] 直接引用匯入的資料，刪除原本很長的陣列
    books = BOOKS_DATA;

    // [新增] 元件初始化時，執行一次分頁
    ngOnInit(): void {
        this.loadBooks();
    }

    // [修改] loadBooks 函式的內容
    loadBooks(): void {
        // 判斷：如果請求的是第一頁，且沒有搜尋文字，就去呼叫真實 API
        if (this.currentPage === 1 && !this.searchText) {
            console.log("正在從真實 API 載入資料...");
            this.ebookService.getEbooksFromApi(this.currentPage, this.pageSize).subscribe({
                next: (response) => {
                    this.paginatedBooks = response.items;
                    this.totalItems = response.totalCount;
                },
                error: (err) => {
                    // [重要] 如果 API 呼叫失敗（例如後端沒開），就改用本地假資料當作備案
                    console.error("API 呼叫失敗，改用本地資料:", err);
                    this.loadLocalBooks();
                }
            });
        } else {
            // 否則（在搜尋，或看第二頁之後），就使用本地假資料
            console.log("正在從本地假資料載入...");
            this.loadLocalBooks();
        }
    }

    // [新增] 一個專門載入本地資料的輔助函式
    loadLocalBooks(): void {
        this.ebookService.getEbooksFromLocal(this.currentPage, this.pageSize).subscribe(response => {
            this.paginatedBooks = response.items;
            this.totalItems = response.totalCount;
        });
    }
    // books = [
    //     {
    //       ebookId: 1, // [新增]
    //       ebookName: "原子習慣",
    //       author: "詹姆斯‧克利爾",
    //       primaryCoverPath: "/assets/images/ebooks/atomic-habits.jpg"
    //     },
    //     {
    //       ebookId: 2, // [新增]
    //       ebookName: "被討厭的勇氣",
    //       author: "岸見一郎, 古賀史健",
    //       primaryCoverPath: "/assets/images/ebooks/courage.jpg"
    //     },
    //     {
    //       ebookId: 3, // [新增]
    //       ebookName: "晶片戰爭",
    //       author: "克里斯・米勒",
    //       primaryCoverPath: "/assets/images/ebooks/chip-war.jpg"
    //     },
    //     {
    //       ebookId: 4, // [新增]
    //       ebookName: "沙丘",
    //       author: "法蘭克・赫伯特",
    //       primaryCoverPath: "/assets/images/ebooks/dune.jpg"
    //     },
    //     {
    //       ebookId: 5, // [新增]
    //       ebookName: "流浪的地球",
    //       author: "劉慈欣",
    //       primaryCoverPath: "/assets/images/ebooks/wandering-earth.jpg"
    //     },
    //     {
    //       ebookId: 6, // [新增]
    //       ebookName: "台北人",
    //       author: "白先勇",
    //       primaryCoverPath: "/assets/images/ebooks/taipei-people.jpg"
    //     },
    //     {
    //       ebookId: 7, // [新增]
    //       ebookName: "做工的人",
    //       author: "林立青",
    //       primaryCoverPath: "/assets/images/ebooks/workers.jpg"
    //     },
    //     {
    //       ebookId: 8, // [新增]
    //       ebookName: "解憂雜貨店",
    //       author: "東野圭吾",
    //       primaryCoverPath: "/assets/images/ebooks/namiya.jpg"
    //     },
    //     {
    //       ebookId: 9, // [新增]
    //       ebookName: "The Great Gatsby",
    //       author: "F. Scott Fitzgerald",
    //       primaryCoverPath: "/assets/images/ebooks/gatsby.jpg"
    //     },
    //     {
    //       ebookId: 10, // [新增]
    //       ebookName: "To Kill a Mockingbird",
    //       author: "Harper Lee",
    //       primaryCoverPath: "/assets/images/ebooks/mockingbird.jpg"
    //     },
    //     {
    //       ebookId: 11, // [新增]
    //       ebookName: "Nineteen Eighty-Four",
    //       author: "George Orwell",
    //       primaryCoverPath: "/assets/images/ebooks/1984.jpg"
    //     },
    //     {
    //       ebookId: 12, // [新增]
    //       ebookName: "Pride and Prejudice",
    //       author: "Jane Austen",
    //       primaryCoverPath: "/assets/images/ebooks/pride.jpg"
    //     },
    //     {
    //       ebookId: 13, // [新增]
    //       ebookName: "Moby-Dick",
    //       author: "Herman Melville",
    //       primaryCoverPath: "/assets/images/ebooks/moby-dick.jpg"
    //     },
    //     {
    //       ebookId: 14, // [新增]
    //       ebookName: "Frankenstein",
    //       author: "Mary Shelley",
    //       primaryCoverPath: "/assets/images/ebooks/frankenstein.jpg"
    //     },
    //     {
    //       ebookId: 15, // [新增]
    //       ebookName: "The Lord of the Rings",
    //       author: "J.R.R. Tolkien",
    //       primaryCoverPath: "/assets/images/ebooks/lotr.gif"
    //     },
    //     {
    //       ebookId: 16, // [新增]
    //       ebookName: "The Adventures of Sherlock Holmes",
    //       author: "Arthur Conan Doyle",
    //       primaryCoverPath: "/assets/images/ebooks/sherlock.jpg"
    //     }
    // ];

    addToCart(book: any): void {
        this.message.success(book.ebookName + ' 已成功加入購物車!');
        this.cartService.addToCart();

    }
    // [新增] 建立一個新函式來隨機打亂標籤順序
    shuffleTags(): void {
        // 這是一個常見的 Fisher-Yates (aka Knuth) 洗牌演算法
        for (let i = this.hotTags.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.hotTags[i], this.hotTags[j]] = [this.hotTags[j], this.hotTags[i]];
        }
    }



}
