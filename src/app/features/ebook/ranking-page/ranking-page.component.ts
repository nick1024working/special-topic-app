import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 建議加入，提供 *ngFor 等基礎指令
import { RouterModule } from '@angular/router'; // 因為您有用 [routerLink]，所以需要這個

// --- 從 NG-ZORRO 匯入需要的模組 ---
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzGridModule } from 'ng-zorro-antd/grid'; // [新增] 匯入 Grid 模組

// [步驟一] 匯入您的共享書籍資料
import { BOOKS_DATA } from '../book-list/books.data';

@Component({
    selector: 'app-ranking-page',
    standalone: true, // 將元件標記為獨立元件
    imports: [
        CommonModule,
        RouterModule,
        NzTabsModule, // 匯入 Tabs 模組
        NzListModule,  // 匯入 List 模組
        NzGridModule  // <-- [修改] 將 NzGridModule 加入到這個陣列中
    ],
    templateUrl: './ranking-page.component.html',
    styleUrls: ['./ranking-page.component.css']
})
export class RankingPageComponent implements OnInit {

    bestsellingBooks: any[] = [];
    hotBooks: any[] = []; // [新增] 為熱門榜建立一個新陣列

    constructor() { }

    ngOnInit(): void {
        // 準備暢銷榜資料
        this.bestsellingBooks = BOOKS_DATA
            .slice(0, 5) // 取前 5 本
            .map(book => ({
                id: book.ebookId,
                title: book.ebookName,
                author: book.author,
                coverImage: book.primaryCoverPath
            }));

        // [新增] 準備熱門榜資料 (這裡我們先用 slice 模擬，真實情境可能來自不同 API)
        this.hotBooks = BOOKS_DATA
            .slice(5, 10) // 取第 6~10 本作為範例
            .map(book => ({
                id: book.ebookId,
                title: book.ebookName,
                author: book.author,
                coverImage: book.primaryCoverPath
            }));
    }
}
