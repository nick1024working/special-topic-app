import { UpdateStatusRequestDto } from './../../dtos/update-status-request.dto';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { BookStatus, BookListQuery, DEFAULT_BOOK_LIST_QUERY } from '../../dtos/book-list-query.dto';
import { distinctUntilChanged, map, tap } from 'rxjs';
import { UsedBookService } from '../../services/used-book.service';
import { UsedBookSellerService } from '../../services/used-book-seller.service';
import { SellerBookListItemDto } from '../../dtos/seller-book-list-item.dto';
import { SortBy, SortDir } from '../../dtos/paging-query.dto';
import { buildPlainParams, buildQueryFromUrl } from '../../utils/book-list.query.mapper';
import { HttpParams } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-ub-seller-book-list-page',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './seller-book-list-page.component.html',
    styleUrls: [
        './seller-book-list-page.component.css',
        '../../styles/bs-custom-override.scss',
    ],
})
export class SellerBookListPageComponent implements OnInit {
    private readonly _sellerSvc = inject(UsedBookSellerService);
    private readonly _bookSvc = inject(UsedBookService);
    private readonly _router = inject(Router);
    private readonly _route = inject(ActivatedRoute);
    private readonly _destroyRef = inject(DestroyRef);

    // 資料容器
    bookList = signal<SellerBookListItemDto[]>([]);

    // Filter 使用的
    pageIndex = signal<number>(DEFAULT_BOOK_LIST_QUERY.paging.pageIndex);
    pageSize = signal<number>(DEFAULT_BOOK_LIST_QUERY.paging.pageSize);
    sortBy = signal<SortBy>(DEFAULT_BOOK_LIST_QUERY.paging.sortBy);
    sortDir = signal<SortDir>(DEFAULT_BOOK_LIST_QUERY.paging.sortDir);
    bookStatus = signal<BookStatus>('all');
    keyword = signal<string | undefined>(undefined);

    // ========== 核心函數 ==========

    // 將目前 UI 狀態組成 BookListQuery
    private querySig = computed<BookListQuery>(() => ({
        paging: {
            pageIndex: this.pageIndex(),
            pageSize: this.pageSize(),
            sortBy: this.sortBy(),
            sortDir: this.sortDir(),
        },
        bookStatus: this.bookStatus(),
        keyword: this.keyword() || undefined,
    }));

    // 將 BookListQuery 組成  query string 並刷新本頁面
    private pushQuery() {
        console.log("[pushQuery]");
        const plain = buildPlainParams(this.querySig());
        console.log(plain);
        this._router.navigate([], {
            relativeTo: this._route,
            queryParams: plain,
            queryParamsHandling: '',
        });
    }

    /** 返回正規化後的 query-string */
    private canon(pm: ParamMap) {
        const pairs = pm.keys.sort().flatMap(k => pm.getAll(k).map(v => [k, v] as const));
        const params = new HttpParams({ fromObject: Object.fromEntries(pairs) });
        return params.toString();
    };

    // 僅由 ngOnInit() 呼叫
    // 將 BookListQuery 當成條件更新 bookList
    private loadList(query: BookListQuery) {
        console.log("[loadList]");
        this._sellerSvc.getSellerBookList(query).subscribe({
            next: (res) => this.bookList.set(res),
            error: (err) => console.error('[loadList]取得書本清單失敗', err),
        });
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this._route.queryParamMap.pipe(
            map(pm => ({ canon: this.canon(pm), q: buildQueryFromUrl(pm) })),
            distinctUntilChanged((a, b) => a.canon === b.canon),
            tap(({ q }) => {
                console.log("[ngOnInit,tap]", q.paging.pageIndex)
                this.pageIndex.set(q.paging.pageIndex);
                this.pageSize.set(q.paging.pageSize);
                this.sortBy.set(q.paging.sortBy);
                this.sortDir.set(q.paging.sortDir);
                this.bookStatus.set(q.bookStatus);
                this.keyword.set(q.keyword ?? undefined);
            }),
            // 手動觸發
            tap(({ q }) => this.loadList(q)),
            takeUntilDestroyed(this._destroyRef)
        ).subscribe();
    }

    // ========== 事件 ==========

    // 篩選
    onStatus(status: BookStatus) {
        this.bookStatus.set(status);
        this.pushQuery();
    }

    // 搜尋
    onSearch() {
        this.pushQuery();
    }

    // 排序
    onToggleSort(field: SortBy) {
        const dir: SortDir =
            this.sortBy() === field && this.sortDir() === 'asc' ? 'desc' : 'asc';
        this.sortBy.set(field);
        this.sortDir.set(dir);
        this.pushQuery();
    }

    // 搜尋
    onDelete(b: SellerBookListItemDto) {
        const request: UpdateStatusRequestDto = { value: false };
        this._bookSvc.updateBookActiveStatus(b.id, request).subscribe();
    }

    // UI更新
    sortIcon(field: SortBy) {
        if (this.sortBy() !== field) return '↕';
        return this.sortDir() === 'asc' ? '↑' : '↓';
    }

    // UI更新
    statusLabel(s: BookStatus) {
        return s === 'all' ? '所有書本' : s === 'onshelf' ? '上架中書本' : '未售出書本';
    }

}
