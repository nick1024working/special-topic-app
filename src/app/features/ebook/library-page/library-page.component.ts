import { Component, OnInit } from '@angular/core';
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
export class LibraryPageComponent implements OnInit {

    private fakePurchasedBooks: any[] = [
        {
            ebookId: 301,
            ebookName: '原子習慣 (前端假資料)',
            author: '詹姆斯‧克利爾',
            primaryCoverPath: '/assets/images/ebooks/atomic-habits.jpg',
            isReadable: true,
            readingProgress: "75"
        },
        {
            ebookId: 305,
            ebookName: '流浪的地球 (前端假資料)',
            author: '劉慈欣',
            primaryCoverPath: '/assets/images/ebooks/wandering-earth.jpg',
            isReadable: true,
            readingProgress: "20"
        },
        {
            ebookId: 308,
            ebookName: '解憂雜貨店 (前端假資料)',
            author: '東野圭吾',
            primaryCoverPath: '/assets/images/ebooks/namiya.jpg',
            isReadable: true,
            readingProgress: "0"
        }
    ];

    purchasedBooks: PurchasedBookDto[] = [];
    filteredBooks: PurchasedBookDto[] = [];
    searchText = '';

    constructor(
        private router: Router,
        private ebookService: EbookService,
        private message: NzMessageService
    ) { }

    ngOnInit(): void {
        this.loadPurchasedBooks();
    }

    loadPurchasedBooks(): void {
        this.ebookService.getPurchasedBooks().subscribe({
            next: (realBooks) => {
                console.log("成功從後端載入書籍:", realBooks);
                this.message.success('已成功載入您的書櫃');

                // --- [修改] 使用更清晰的合併邏輯 ---

                // 1. 建立一個 Set，存放所有從後端拿到的真實書籍的 ID
                const realBookIds = new Set(realBooks.map(b => b.ebookId));

                // 2. 篩選前端的假資料，只保留那些 ID 不在真實書籍 ID 列表中的書籍
                const uniqueFakeBooks = this.fakePurchasedBooks.filter(fakeBook => !realBookIds.has(fakeBook.ebookId));

                // 3. 將真實書籍陣列與篩選後的不重複假書籍陣列合併
                //    這樣可以確保真實書籍永遠排在最前面
                this.purchasedBooks = [...realBooks, ...uniqueFakeBooks];

                this.filterBooks();
            },
            error: (err) => {
                console.error("載入後端書櫃失敗，啟用前端備援資料:", err);
                this.message.warning('無法連線至伺服器，目前顯示為離線書櫃');

                this.purchasedBooks = this.fakePurchasedBooks;
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
