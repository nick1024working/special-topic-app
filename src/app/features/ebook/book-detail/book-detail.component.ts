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
}
