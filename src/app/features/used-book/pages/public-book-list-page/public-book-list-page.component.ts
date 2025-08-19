import { IdNameDto } from './../../dtos/id-name.dto';
import { Component, inject, ViewEncapsulation, signal } from '@angular/core';
import { BookCardComponent } from "../../components/book-card/book-card.component";
import { UsedBookService } from '../../services/used-book.service';
import { BookListQuery } from './../../dtos/book-list-query.dto';
import { PublicBookListItemDto } from '../../dtos/public-book-list-item.dto';
import { BookCard } from '../../models/book-card.mode';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { buildQueryFromUrl, buildUrlFromQuery } from '../../utils/book-list.query.mapper';
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
    private readonly _router = inject(Router);

    bookCardList: BookCard[] = [];
    categoryMap: Map<number, string> = new Map<number, string>([ [0, "全部分類"] ]);
    currentCategory = signal<string | null>(null);

    ngOnInit(): void {
        this._lookupSvc.GetBookCategoryList().subscribe({
            next: (res) => {
                res.forEach(i => this.categoryMap.set(i.id, i.name));
            },
            error: (err) => console.error("[ngOnInit]無法取回 categoryList ", err),
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
        console.log(query);
        this.currentCategory.set(this.categoryMap.get(query.categoryId ?? 0) ?? null);
    }

    onQuery(query: BookListQuery) {

        this.fillList(query);

        const paramMap = buildUrlFromQuery(query);

        // ParamMap → plain object
        const qp: Record<string, string | string[]> = {};
        for (const k of paramMap.keys) {
            const all = paramMap.getAll(k);
            qp[k] = all.length > 1 ? all : (all[0] ?? '');
        }

        // 更新網址（不跳頁）
        this._router.navigate([], {
            relativeTo: this._activatedRoute,
            queryParams: qp,
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }
}
