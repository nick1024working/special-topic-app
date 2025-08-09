import { Component } from '@angular/core';
import { BookCardComponent } from "../book-card/book-card.component";
import { BookListQuery } from './../../dtos/book-list-query.dto';
import { UsedBookService } from '../../services/used-book.service';
import { PublicBookListItemDto } from '../../dtos/public-book-list-item.dto';
import { BookCard } from '../../models/book-card.mode';
import { environment } from '@env/environment';

@Component({
    selector: 'app-book-row',
    standalone: true,
    imports: [BookCardComponent],
    templateUrl: './book-row.component.html',
    styleUrl: './book-row.component.css'
})
/** 顯示 4 個 BookCard 的元件
 *
 * @remarks
 * 目前沒有 input/output 功能
 * 直接使用 UsedBookBookService.GetPublicBookList()
 *
 */
export class BookRowComponent {

    // HACK: 直接不打 API 直接組後端 api.BaseUrl + coverUrl
    private readonly baseUrl = `${environment.apiBaseUrl}`;

    publicBookList: PublicBookListItemDto[] = [];
    bookCardList: BookCard[] = [];

    constructor(private _svc: UsedBookService) { }

    ngOnInit(): void {
        const query: BookListQuery = {};
        this.fillList(query);
    }

    /** 使用當前 query 查詢 GetPublicBookList() */
    fillList(query: BookListQuery) {
        this._svc.GetPublicBookList(query).subscribe({
            next: (res) => {
                this.bookCardList = res
                    .slice(0, 4)
                    .map(r => ({
                        // HACK: 直接不打 API 直接組後端 api.BaseUrl + coverUrl
                        coverImageUrl: this.baseUrl + r.coverImageUrl,
                        saleTagList: r.saleTagList,
                        id: r.id,
                        title: r.title,
                        authors: r.authors,
                        salePrice: r.salePrice,
                        conditionRating: r.conditionRating,
                        slug: r.slug,
                    } as BookCard));
                console.log(this.bookCardList);
            },
            error: (err) => console.error('取得書本公開清單失敗', err),
        });
    }

    /** 測試用事件，使用指定 query 查詢 */
    tmpClick() {
        const query: BookListQuery = {
            minPrice: 400,
            maxPrice: 800,
            sortBy: 'price',
            sortDir: 'desc',
        };
        this.fillList(query);
        console.log(query);
    }
}
