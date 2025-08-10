import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CartService } from '../services/cart.service';
import { RouterModule } from '@angular/router';
import { BOOKS_DATA } from './books.data'; // [新增] 匯入共用資料
import { FormsModule } from '@angular/forms'; // 處理 [(ngModel)] 雙向綁定
import { NzInputModule } from 'ng-zorro-antd/input';   // 搜尋框模組


@Component({
    selector: 'app-book-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule, // [新增]
        NzCardModule,
        NzGridModule,
        NzButtonModule,
        NzMessageModule,
        NzIconModule,
        RouterModule,
        NzInputModule,   // [新增]

    ],
    templateUrl: './book-list.component.html',
    styleUrls: ['./book-list.component.css']
})
export class BookListComponent {

    constructor(
        private message: NzMessageService,
        private cartService: CartService
    ) { }

    searchText = '';
    selectedCategory = 1;

    categories = [
        { id: 1, name: '所有分類' },
        { id: 2, name: '文學小說' },
        { id: 3, name: '商業理財' },
        { id: 4, name: '心理勵志' },
        { id: 5, name: '電腦資訊' },
    ];

    // [修改] 直接引用匯入的資料，刪除原本很長的陣列
    books = BOOKS_DATA;
    // books = [
    //     {
    //       ebookId: 1, // [新增]
    //       ebookName: "原子習慣",
    //       author: "詹姆斯‧克利爾",
    //       primaryCoverPath: "/assets/images/ebooks/atomic-habits.jpg"
    //     },
    //     {
    //       ebookId: 2, // [新增]
    //       ebookName: "被討厭的勇氣",
    //       author: "岸見一郎, 古賀史健",
    //       primaryCoverPath: "/assets/images/ebooks/courage.jpg"
    //     },
    //     {
    //       ebookId: 3, // [新增]
    //       ebookName: "晶片戰爭",
    //       author: "克里斯・米勒",
    //       primaryCoverPath: "/assets/images/ebooks/chip-war.jpg"
    //     },
    //     {
    //       ebookId: 4, // [新增]
    //       ebookName: "沙丘",
    //       author: "法蘭克・赫伯特",
    //       primaryCoverPath: "/assets/images/ebooks/dune.jpg"
    //     },
    //     {
    //       ebookId: 5, // [新增]
    //       ebookName: "流浪的地球",
    //       author: "劉慈欣",
    //       primaryCoverPath: "/assets/images/ebooks/wandering-earth.jpg"
    //     },
    //     {
    //       ebookId: 6, // [新增]
    //       ebookName: "台北人",
    //       author: "白先勇",
    //       primaryCoverPath: "/assets/images/ebooks/taipei-people.jpg"
    //     },
    //     {
    //       ebookId: 7, // [新增]
    //       ebookName: "做工的人",
    //       author: "林立青",
    //       primaryCoverPath: "/assets/images/ebooks/workers.jpg"
    //     },
    //     {
    //       ebookId: 8, // [新增]
    //       ebookName: "解憂雜貨店",
    //       author: "東野圭吾",
    //       primaryCoverPath: "/assets/images/ebooks/namiya.jpg"
    //     },
    //     {
    //       ebookId: 9, // [新增]
    //       ebookName: "The Great Gatsby",
    //       author: "F. Scott Fitzgerald",
    //       primaryCoverPath: "/assets/images/ebooks/gatsby.jpg"
    //     },
    //     {
    //       ebookId: 10, // [新增]
    //       ebookName: "To Kill a Mockingbird",
    //       author: "Harper Lee",
    //       primaryCoverPath: "/assets/images/ebooks/mockingbird.jpg"
    //     },
    //     {
    //       ebookId: 11, // [新增]
    //       ebookName: "Nineteen Eighty-Four",
    //       author: "George Orwell",
    //       primaryCoverPath: "/assets/images/ebooks/1984.jpg"
    //     },
    //     {
    //       ebookId: 12, // [新增]
    //       ebookName: "Pride and Prejudice",
    //       author: "Jane Austen",
    //       primaryCoverPath: "/assets/images/ebooks/pride.jpg"
    //     },
    //     {
    //       ebookId: 13, // [新增]
    //       ebookName: "Moby-Dick",
    //       author: "Herman Melville",
    //       primaryCoverPath: "/assets/images/ebooks/moby-dick.jpg"
    //     },
    //     {
    //       ebookId: 14, // [新增]
    //       ebookName: "Frankenstein",
    //       author: "Mary Shelley",
    //       primaryCoverPath: "/assets/images/ebooks/frankenstein.jpg"
    //     },
    //     {
    //       ebookId: 15, // [新增]
    //       ebookName: "The Lord of the Rings",
    //       author: "J.R.R. Tolkien",
    //       primaryCoverPath: "/assets/images/ebooks/lotr.gif"
    //     },
    //     {
    //       ebookId: 16, // [新增]
    //       ebookName: "The Adventures of Sherlock Holmes",
    //       author: "Arthur Conan Doyle",
    //       primaryCoverPath: "/assets/images/ebooks/sherlock.jpg"
    //     }
    // ];

    addToCart(book: any): void {
        this.message.success(book.ebookName + ' 已成功加入購物車!');
        this.cartService.addToCart();

    }
}
