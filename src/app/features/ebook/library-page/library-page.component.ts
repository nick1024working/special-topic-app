import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
    selector: 'app-library-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzCardModule,
        NzGridModule,
        NzProgressModule
    ],
    templateUrl: './library-page.component.html',
    styleUrls: ['./library-page.component.css']
})
export class LibraryPageComponent {

    // 假的已購買書籍，並加上閱讀進度與 ID
    purchasedBooks = [
        {
            ebookId: 2, // 假設 ID，用來跳轉到詳細頁
            ebookName: '被討厭的勇氣',
            author: '岸見一郎, 古賀史健',
            primaryCoverPath: '/assets/images/ebooks/courage.jpg',
            progress: 75 // 閱讀進度 75%
        },
        {
            ebookId: 5,
            ebookName: '流浪的地球',
            author: '劉慈欣',
            primaryCoverPath: '/assets/images/ebooks/wandering-earth.jpg',
            progress: 20 // 閱讀進度 20%
        },
        {
            ebookId: 8,
            ebookName: '解憂雜貨店',
            author: '東野圭吾',
            primaryCoverPath: '/assets/images/ebooks/namiya.jpg',
            progress: 0 // 尚未開始閱讀
        },
    ];
}
