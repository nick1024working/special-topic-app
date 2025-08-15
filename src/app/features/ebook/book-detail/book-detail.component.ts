import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { BOOKS_DATA } from '../book-list/books.data';
import { EbookService } from '../services/ebook.service';

@Component({
    selector: 'app-book-detail',
    standalone: true,
    imports: [
        CommonModule, RouterModule, NzGridModule,
        NzButtonModule, NzIconModule, NzCarouselModule
    ],
    templateUrl: './book-detail.component.html',
    styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {

    book: any;

    constructor(private route: ActivatedRoute, private ebookService: EbookService) { }

    ngOnInit(): void {
        const bookIdStr = this.route.snapshot.paramMap.get('id');

        if (bookIdStr) {
            const bookId = +bookIdStr;

            if (bookId > 300) {
                // --- [修改] 假資料處理邏輯 ---
                const fakeBook = BOOKS_DATA.find(b => b.ebookId === bookId);
                if (fakeBook) {
                    this.book = {
                        ...fakeBook,
                        // 手動補上後端 DTO 才有的欄位，給予預設值
                        publisher: '測試出版社',
                        bookDescription: '這是來自前端假資料的書籍詳細描述，用於測試排版效果。',
                        imagePaths: [fakeBook.primaryCoverPath]
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
}
