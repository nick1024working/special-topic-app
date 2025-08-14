import { Component, inject, ViewEncapsulation } from '@angular/core';
import { BookCardComponent } from "../../components/book-card/book-card.component";
import { UsedBookService } from '../../services/used-book.service';
import { BookListQuery } from './../../dtos/book-list-query.dto';
import { PublicBookListItemDto } from '../../dtos/public-book-list-item.dto';
import { BookCard } from '../../models/book-card.mode';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { buildQueryFromUrl } from '../../utils/book-list.query.mapper';
import { BookFilterComponent } from "../../components/book-filter/book-filter.component";
import { LookupService } from '../../services/lookup.service';

@Component({
    selector: 'app-ub-public-book-list-page',
    standalone: true,
    imports: [BookCardComponent, BookFilterComponent, RouterLink],
    templateUrl: './public-book-list-page.component.html',
    styleUrls: [
        './public-book-list-page.component.css',
        '../../styles/bs-custom-override.scss',
    ],
    encapsulation: ViewEncapsulation.Emulated,
})
/** BookCard 主要商品列表頁(PLP)
 *
 * @remarks
 * 目前沒有 input/output 功能
 * 直接使用 UsedBookBookService.GetPublicBookList()
 *
 */
export class PublicBookListPageComponent {

    private readonly _svc = inject(UsedBookService);
    private readonly _lookupSvc = inject(LookupService);
    private readonly _activatedRoute = inject(ActivatedRoute);

    categoryMap: Map<number, string> = new Map<number, string>();
    currentCategory?: string;
    publicBookList: PublicBookListItemDto[] = [];
    bookCardList: BookCard[] = [];

    ngOnInit(): void {
        this._lookupSvc.GetBookCategoryList().subscribe({
            next: (res) => {
                res.forEach(c => this.categoryMap.set(c.id, c.name));
            },
            error: (err) => { console.error("[ngOnInit]無法取得書本主題分類清單"); }
        });
        const query: BookListQuery = buildQueryFromUrl(this._activatedRoute.snapshot.queryParamMap);
        this.fillList(query);
    }

    /** 使用當前 query 查詢 GetPublicBookList() */
    fillList(query: BookListQuery) {
        this._svc.getPublicBookList(query).subscribe({
            next: (res) => {
                this.bookCardList = res
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

    onQuery(query: BookListQuery) {
        this.fillList(query);
        this.currentCategory = this.categoryMap.get(query.categoryId ?? -1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
