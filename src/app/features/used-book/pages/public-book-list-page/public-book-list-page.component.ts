import { Component } from '@angular/core';
import { BookCardComponent } from "../../components/book-card/book-card.component";
import { UsedBookService } from '../../services/used-book.service';
import { BookListQuery, DEFAULT_BOOK_LIST_QUERY } from './../../dtos/book-list-query.dto';
import { PublicBookListItemDto } from '../../dtos/public-book-list-item.dto';
import { BookCard } from '../../models/book-card.mode';
import { environment } from '@env/environment';
import { NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { buildQueryFromUrl } from '../../utils/book-list.query.mapper';

@Component({
    selector: 'app-ub-public-book-list-page',
    standalone: true,
    imports: [BookCardComponent],
    templateUrl: './public-book-list-page.component.html',
    styleUrl: './public-book-list-page.component.css',
})
/** BookCard 主要商品列表頁(PLP)
 *
 * @remarks
 * 目前沒有 input/output 功能
 * 直接使用 UsedBookBookService.GetPublicBookList()
 *
 */
export class PublicBookListPageComponent {

    CARD_PER_ROW = 100;

    // HACK: 直接不打 API 直接組後端 api.BaseUrl + coverUrl
    private readonly baseUrl = `${environment.apiBaseUrl}`;

    publicBookList: PublicBookListItemDto[] = [];
    bookCardList: BookCard[] = [];

    constructor(
        private _svc: UsedBookService,
        private activatedRoute: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        const query: BookListQuery = buildQueryFromUrl(this.activatedRoute.snapshot.queryParamMap);
        this.fillList(query);
    }

    /** 使用當前 query 查詢 GetPublicBookList() */
    fillList(query: BookListQuery) {
        this._svc.getPublicBookList(query).subscribe({
            next: (res) => {
                this.bookCardList = res
                    .slice(0, this.CARD_PER_ROW)
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
                console.log('成功取回');
                console.log(this.bookCardList);
            },
            error: (err) => console.error('取得書本公開清單失敗', err),
        });
    }

    /** 測試用事件，使用指定 query 查詢 */
    tmpClick() {
        const query: BookListQuery = {
            bookStatus: 'all',
            sortBy: 'price',
            sortDir: 'desc',
            minPrice: 200,
            maxPrice: 1800,
        };
        this.fillList(query);
        console.log("tmpClick");
        console.log(query);
    }
}
