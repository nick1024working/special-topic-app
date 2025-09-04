import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { BookCardComponent } from "../../components/book-card/book-card.component";
import { UsedBookService } from '../../services/used-book.service';
import { BookListQuery, BookStatus, DEFAULT_BOOK_LIST_QUERY } from './../../dtos/book-list-query.dto';
import { BookCard } from '../../models/book-card.model';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { buildPlainParams, buildQueryFromUrl } from '../../utils/book-list.query.mapper';
import { BookFilterComponent } from "../../components/book-filter/book-filter.component";
import { LookupService } from '../../services/lookup.service';
import { SortBy, SortDir } from '../../dtos/paging-query.dto';
import { distinctUntilChanged, map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpParams } from '@angular/common/http';
import { pageWindow } from '../../utils/pagination-helper';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-ub-public-book-list-page',
    standalone: true,
    imports: [BookCardComponent, BookFilterComponent, RouterLink, FormsModule],
    templateUrl: './public-book-list-page.component.html',
    styleUrls: ['./public-book-list-page.component.css', '../../styles/bs-custom-override.scss',]
})

/** 主要公開商品列表頁(PLP)，以 BookCard 樣式呈現上架中商品
 *
 * @remarks
 * 目前沒有 input/output 功能
 * 直接使用 UsedBookBookService.GetPublicBookList()
 *
 */
export class PublicBookListPageComponent {

    private readonly _svc = inject(UsedBookService);
    private readonly _lookupSvc = inject(LookupService);
    private readonly _router = inject(Router);
    private readonly _route = inject(ActivatedRoute);
    private readonly _destroyRef = inject(DestroyRef);

    // 載入後端資料用
    categoryMap: Map<number, string> = new Map<number, string>([[0, "全部分類"]]);
    bookCardList: BookCard[] = [];

    // UI: Paging 用
    totalRows = signal<number>(0);
    totalPages = signal<number>(0);
    hasNextPage = signal<boolean>(false);
    readonly pageNoList = computed(() => pageWindow(this.pageIndex(), this.totalPages()));
    readonly allPageNoList = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

    // UI：原子 signals（越小顆越好）
    pageIndex = signal(DEFAULT_BOOK_LIST_QUERY.paging.pageIndex);
    pageSize = signal(DEFAULT_BOOK_LIST_QUERY.paging.pageSize);
    sortBy = signal<SortBy>(DEFAULT_BOOK_LIST_QUERY.paging.sortBy);
    sortDir = signal<SortDir>(DEFAULT_BOOK_LIST_QUERY.paging.sortDir);
    bookStatus = signal<BookStatus>('onshelf');
    categoryId = signal<number | null>(null);
    saleTagIds = signal<number[] | null>(null);
    keyword = signal<string>('');
    minPrice = signal<number | null>(null);
    maxPrice = signal<number | null>(null);

    // =========== 核心函數 ===========

    /** 將目前 UI 狀態組成 BookListQuery
     * signal -> BookListQuery
     */
    private querySig = computed<BookListQuery>(() => ({
        paging: {
            pageIndex: this.pageIndex(),
            pageSize: this.pageSize(),
            sortBy: this.sortBy(),
            sortDir: this.sortDir(),
        },
        bookStatus: this.bookStatus(),
        categoryId: this.categoryId() ?? undefined,
        saleTagIds: this.saleTagIds() ?? undefined,
        keyword: this.keyword().trim() || undefined,
        minPrice: this.minPrice() === null ? undefined : this.minPrice()!,
        maxPrice: this.maxPrice() === null ? undefined : this.maxPrice()!,
    }));

    /** 將本元件原子 signals 組成 query-string 並刷新本頁面
     * BookListQuery -> 扁平化 -> queryParams -> Router
     */
    pushQuery() {
        const plain = buildPlainParams(this.querySig());
        this._router.navigate([], {
            relativeTo: this._route,
            queryParams: plain,
            queryParamsHandling: '',
        });
    }

    /** 使用指定 BookListQuery 從後端查詢並映射為 BookCard */
    fillList(query: BookListQuery) {
        this._svc.getPublicBookList(query).subscribe({
            next: (res) => {
                this.bookCardList = res.items
                    .map(r => ({
                        coverImageUrl: r.coverImageUrl,
                        saleTagList: r.saleTagList.map(tag => tag.name),
                        id: r.id,
                        title: r.title,
                        authors: r.authors,
                        salePrice: r.salePrice,
                        conditionRating: r.conditionRating,
                        slug: r.slug,
                    } as BookCard));
                this.pageIndex.set(res.pageIndex + 1);
                this.pageSize.set(res.pageSize);
                this.totalRows.set(res.totalRows);
                this.totalPages.set(res.totalPages);
                this.hasNextPage.set(res.hasNextPage);
            },
            error: (err) => console.error('取得書本公開清單失敗', err),
        });
    }

    // ========== HOOK ==========

    // 呼叫 fillList() 的統一入口
    ngOnInit(): void {
        this._lookupSvc.getBookCategoryList().subscribe({
            next: (res) => res.forEach(i => this.categoryMap.set(i.id, i.name)),
            error: (err) => console.error("[ngOnInit]無法取回 categoryList ", err),
        });
        // URL 作為唯一觸發點：URL -> signals -> fillList
        this._route.queryParamMap.pipe(
            map(pm => ({ canon: this.canon(pm), q: buildQueryFromUrl(pm) })), // 這裡把字串安全轉型
            distinctUntilChanged((a, b) => a.canon === b.canon),
            tap(({ q }) => {
                // 同步回 signals（避免 UI 與 URL 失聯）
                this.pageIndex.set(q.paging.pageIndex);
                this.pageSize.set(q.paging.pageSize);
                this.sortBy.set(q.paging.sortBy);
                this.sortDir.set(q.paging.sortDir);
                this.bookStatus.set(q.bookStatus);
                this.categoryId.set(q.categoryId ?? null);
                this.saleTagIds.set(q.saleTagIds ?? null);
                this.keyword.set(q.keyword ?? '');
                this.minPrice.set(q.minPrice ?? null);
                this.maxPrice.set(q.maxPrice ?? null);
            }),
            tap(({ q }) => this.fillList(q)),
            takeUntilDestroyed(this._destroyRef)
        ).subscribe();
    }

    // ========== 事件 ==========

    //** 接收來自本元件的排序條件，並呼叫 pushQuery() */
    onSortOrderSelect([sortBy, sortDir]: [SortBy, SortDir]) {
        this.sortBy.set(sortBy);
        this.sortDir.set(sortDir);
        this.pageIndex.set(1);  // 回到第一頁
        this.pushQuery();
    }

    /** 讀取當前 [sortBy, sortDir] 更新UI顯示 */
    getStatusLabel([sortBy, sortDir]: [SortBy, SortDir]) {
        if (sortBy === 'updated' && sortDir === 'desc') {
            return '更新由新到舊';
        } else if (sortBy === 'updated' && sortDir === 'asc') {
            return '更新由舊到新';
        } else if (sortBy === 'price' && sortDir === 'asc') {
            return '價格由低到高';
        } else if (sortBy === 'price' && sortDir === 'desc') {
            return '價格由高到低';
        } else {
            return '更新由新到舊';
        }
    }

    //** 接收來自本元件的pagesize，並呼叫 pushQuery() */
    onPageSizeSelect(pagesize: number) {
        this.pageSize.set(pagesize);
        this.pageIndex.set(1);  // 回到第一頁
        this.pushQuery();
    }

    /** 讀取當前 pagesize 更新UI顯示 */
    getPageSizeLabel(pagesize: number) {
        if (pagesize === 20) {
            return '每頁20筆';
        } else if (pagesize === 50) {
            return '每頁50筆';
        } else if (pagesize === 100) {
            return '每頁100筆';
        } else {
            return '每頁5筆';
        }
    }

    getCategoryName() {
        return this.categoryMap.get(this.categoryId() ?? 0);
    }

    //** 接收來自 filter 元件的所有條件，取本元件所需，並呼叫 pushQuery() */
    onFilterChanged(query: BookListQuery) {
        this.categoryId.set(query.categoryId ?? null);
        this.saleTagIds.set(query.saleTagIds ?? null);
        this.minPrice.set(query.minPrice ?? null);
        this.maxPrice.set(query.maxPrice ?? null);
        this.pageIndex.set(1);  // 回到第一頁
        this.pushQuery();
        this.scrollToTop();
    }

    //** 接收來自 paging UI 的條件，並呼叫 pushQuery() */
    onPageChange(p: number) {
        this.pageIndex.set(p);
        this.pushQuery();
        this.scrollToTop();
    }

    /** 返回正規化後的 query-string */
    private canon(pm: ParamMap) {
        const pairs = pm.keys.sort().flatMap(k => pm.getAll(k).map(v => [k, v] as const));
        const params = new HttpParams({ fromObject: Object.fromEntries(pairs) });
        return params.toString();
    };

    private scrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }
}
