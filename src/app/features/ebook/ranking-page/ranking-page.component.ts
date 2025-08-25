import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { EbookService } from '../services/ebook.service'; // <-- [修改] 只從 service 匯入 EbookService
import { RankingBookDto } from '../DTOs/ranking-book.dto'; // <-- [新增] 從 DTOs 資料夾匯入 RankingBookDto
import { BOOKS_DATA } from '../book-list/books.data';

@Component({
    selector: 'app-ranking-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzListModule,
        NzGridModule
    ],
    templateUrl: './ranking-page.component.html',
    styleUrls: ['./ranking-page.component.css']
})
export class RankingPageComponent implements OnInit {

    // [修改] 類型改為 RankingBookDto
    bestsellingBooks: RankingBookDto[] = [];
    hotBooks: RankingBookDto[] = [];
    editorPicksBooks: RankingBookDto[] = [];
    newReleasesBooks: RankingBookDto[] = [];

    constructor(private ebookService: EbookService) { } // [修改] 注入 EbookService

    ngOnInit(): void {
        this.ebookService.getRankingBooks().pipe(
            timeout(5000), // 設定 5 秒的超時時間
            catchError(error => {
                // 如果發生錯誤 (例如後端沒開) 或超時，就執行這裡
                console.error('無法從後端載入排行榜資料，啟用備援資料:', error);
                this.loadFallbackData(); // 呼叫備援資料載入函式
                return of(null); // 回傳一個 null 的 Observable，讓後續的 subscribe 不會出錯
            })
        ).subscribe(data => {
            if (data) {
                // 如果成功從後端取得資料
                this.bestsellingBooks = data['暢銷排行榜'] || [];
                this.hotBooks = data['熱門排行榜'] || [];
                this.editorPicksBooks = data['編輯推薦'] || [];
                this.newReleasesBooks = data['新書推薦'] || [];

                // 檢查是否所有列表都為空，如果是，也啟用備援資料
                if (this.bestsellingBooks.length === 0 && this.hotBooks.length === 0 && this.editorPicksBooks.length === 0 && this.newReleasesBooks.length === 0) {
                    console.warn('後端回傳空的排行榜資料，啟用備援資料');
                    this.loadFallbackData();
                }
            }
            // 如果 data 是 null (代表已在 catchError 中處理過)，則不執行任何操作
        });
    }

    // [新增] 建立一個專門載入前端假資料的函式
    private loadFallbackData(): void {
        const mapToRankingDto = (book: any): RankingBookDto => ({
            id: book.ebookId,
            title: book.ebookName,
            author: book.author,
            coverImage: book.primaryCoverPath,
            price: book.actualPrice || book.fixedPrice
        });

        this.bestsellingBooks = BOOKS_DATA.slice(0, 4).map(mapToRankingDto);
        this.hotBooks = BOOKS_DATA.slice(4, 8).map(mapToRankingDto);
        this.editorPicksBooks = BOOKS_DATA.slice(8, 12).map(mapToRankingDto);
        this.newReleasesBooks = BOOKS_DATA.slice(12, 16).map(mapToRankingDto);
    }
}