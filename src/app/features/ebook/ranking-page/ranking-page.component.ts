import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { BOOKS_DATA } from '../book-list/books.data';

@Component({
    selector: 'app-ranking-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzTabsModule,
        NzListModule,
        NzGridModule
    ],
    templateUrl: './ranking-page.component.html',
    styleUrls: ['./ranking-page.component.css']
})
export class RankingPageComponent implements OnInit {

    bestsellingBooks: any[] = [];
    hotBooks: any[] = [];
    editorPicksBooks: any[] = [];
    newReleasesBooks: any[] = []; // [新增] 為新書推薦建立新陣列

    constructor() { }

    ngOnInit(): void {
        // [修改] 將每個列表的長度調整為 4，以平均分配
        this.bestsellingBooks = BOOKS_DATA
            .slice(0, 4)
            .map(book => ({
                id: book.ebookId,
                title: book.ebookName,
                author: book.author,
                coverImage: book.primaryCoverPath,
                // [新增] 加入最終價格欄位
        price: book.actualPrice || book.fixedPrice
                
            }));

        this.hotBooks = BOOKS_DATA
            .slice(4, 8)
            .map(book => ({
                id: book.ebookId,
                title: book.ebookName,
                author: book.author,
                coverImage: book.primaryCoverPath,
                // [新增] 加入最終價格欄位
                price: book.actualPrice || book.fixedPrice
            }));

        this.editorPicksBooks = BOOKS_DATA
            .slice(8, 12)
            .map(book => ({
                id: book.ebookId,
                title: book.ebookName,
                author: book.author,
                coverImage: book.primaryCoverPath,
                // [新增] 加入最終價格欄位
                price: book.actualPrice || book.fixedPrice
            }));

        // [新增] 準備新書推薦榜資料
        this.newReleasesBooks = BOOKS_DATA
            .slice(12, 16)
            .map(book => ({
                id: book.ebookId,
                title: book.ebookName,
                author: book.author,
                coverImage: book.primaryCoverPath,
                // [新增] 加入最終價格欄位
                price: book.actualPrice || book.fixedPrice
            }));
    }
}
