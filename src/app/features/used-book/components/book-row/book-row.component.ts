import { Component, inject, Input } from '@angular/core';
import { BookCardComponent } from "../book-card/book-card.component";
import { BookListQuery, DEFAULT_BOOK_LIST_QUERY } from './../../dtos/book-list-query.dto';
import { UsedBookService } from '../../services/used-book.service';
import { PublicBookListItemDto } from '../../dtos/public-book-list-item.dto';
import { BookCard } from '../../models/book-card.mode';

@Component({
    selector: 'app-ub-book-row',
    standalone: true,
    imports: [BookCardComponent],
    templateUrl: './book-row.component.html',
    styleUrl: './book-row.component.css'
})

/** 顯示 6 個 BookCard 的元件
 *
 *
 */
export class BookRowComponent {
    private readonly _svc = inject(UsedBookService);

    @Input() title: string = "";
    @Input() bookCardList: BookCard[] = [];
    @Input() moreLink: string = "/";
}
