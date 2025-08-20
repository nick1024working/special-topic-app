import { Component } from '@angular/core';
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
 * @remarks
 * 目前沒有 input/output 功能
 * 直接使用 UsedBookBookService.GetPublicBookList()
 *
 */
export class BookRowComponent {

    CARD_PER_ROW = 5;

    publicBookList: PublicBookListItemDto[] = [];
    bookCardList: BookCard[] = [];

    constructor(private _svc: UsedBookService) { }

    ngOnInit(): void {
        const query: BookListQuery = DEFAULT_BOOK_LIST_QUERY;
        this.fillList(query);
    }

    /** 使用當前 query 查詢 GetPublicBookList() */
    fillList(query: BookListQuery) {
        this._svc.getPublicBookList(query).subscribe({
            next: (res) => {
                this.bookCardList = res.items
                    .slice(0, this.CARD_PER_ROW)
                    .map(r => ({
                        coverImageUrl: r.coverImageUrl,
                        saleTagList: r.saleTagList,
                        id: r.id,
                        title: r.title,
                        authors: r.authors,
                        salePrice: r.salePrice,
                        conditionRating: r.conditionRating,
                        slug: r.slug,
                    } as BookCard));
            },
            error: (err) => console.error('取得書本公開清單失敗', err),
        });
    }
}
