import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { Router } from '@angular/router'; // 導入 Router

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
    purchasedBooks = [
        {
            ebookId: 2,
            ebookName: '被討厭的勇氣',
            author: '岸見一郎, 古賀史健',
            primaryCoverPath: '/assets/images/ebooks/courage.jpg',
            progress: 75
        },
        {
            ebookId: 5,
            ebookName: '流浪的地球',
            author: '劉慈欣',
            primaryCoverPath: '/assets/images/ebooks/wandering-earth.jpg',
            progress: 20
        },
        {
            ebookId: 8,
            ebookName: '解憂雜貨店',
            author: '東野圭吾',
            primaryCoverPath: '/assets/images/ebooks/namiya.jpg',
            progress: 0
        },
    ];

    constructor(private router: Router) { }

    openBook(ebookId: number) {
        // 這裡可以導航到書籍詳情或閱讀頁，例如 /book/2
        this.router.navigate(['/book', ebookId]);
    }
}
