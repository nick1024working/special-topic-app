import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router'; // [修改]
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BOOKS_DATA } from '../book-list/books.data';
import { EbookService } from '../services/ebook.service';

@Component({
    selector: 'app-book-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, NzGridModule, NzButtonModule, NzIconModule],
    templateUrl: './book-detail.component.html',
    styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {

    book: any;

    constructor(private route: ActivatedRoute, private ebookService: EbookService) { }

    ngOnInit(): void {
        const bookIdStr = this.route.snapshot.paramMap.get('id'); // 1. 先用新變數儲存字串

        if (bookIdStr) { // 2. 檢查字串是否存在
            const bookId = +bookIdStr; // 3. [修正] 使用 '+' 將字串轉為數字

            // 現在 bookId 是數字了，可以正常比較
            if (bookId > 300) {
                // 如果是假資料 (ID > 300)，就從本地陣列尋找
                console.log(`正在從本地尋找 ID 為 ${bookId} 的假資料...`);
                this.book = BOOKS_DATA.find(b => b.ebookId === bookId);
            } else {
                // 如果是真實資料，才呼叫 API
                console.log(`正在從 API 請求 ID 為 ${bookId} 的真實資料...`);
                this.ebookService.getEbookById(bookId).subscribe(data => {
                    this.book = data;
                });
            }
        }
    }
}
