import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { Router } from '@angular/router'; // 導入 Router
import { FormsModule } from '@angular/forms'; // [新增]
import { NzInputModule } from 'ng-zorro-antd/input';   // [新增]
import { NzIconModule } from 'ng-zorro-antd/icon';     // [新增]
import { NzButtonModule } from 'ng-zorro-antd/button';   // [新增]


@Component({
    selector: 'app-library-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzCardModule,
        NzGridModule,
        NzProgressModule,
        FormsModule, // [新增]
        NzInputModule,   // [新增]
        NzIconModule,    // [新增]
        NzButtonModule   // [新增]
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

    // [新增] 用於搜尋的屬性
    searchText = '';
    filteredBooks: any[] = []; // 用於存放篩選後的書籍

    ngOnInit(): void {
        // [新增] 元件初始化時，先顯示所有書籍
        this.filterBooks();
    }

    // [新增] 根據 searchText 篩選書籍的函式
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
}
