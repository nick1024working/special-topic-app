import { UpdateStatusRequestDto } from './../../dtos/update-status-request.dto';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookStatus, BookListQuery, DEFAULT_BOOK_LIST_QUERY } from '../../dtos/book-list-query.dto';
import { catchError, distinctUntilChanged, map, of, tap } from 'rxjs';
import { UsedBookService } from '../../services/used-book.service';
import { UsedBookSellerService } from '../../services/used-book-seller.service';
import { SellerBookListItemDto } from '../../dtos/seller-book-list-item.dto';
import { SortBy, SortDir } from '../../dtos/paging-query.dto';

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
    private readonly _svc = inject(UsedBookSellerService);
    private readonly _bookSvc = inject(UsedBookService);
    private readonly _router = inject(Router);
    private readonly _route = inject(ActivatedRoute);

    // BookList 使用的
    bookList = signal<SellerBookListItemDto[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Filter 使用的
    pageIndex = signal<number>(DEFAULT_BOOK_LIST_QUERY.paging.pageIndex);
    pageSize = signal<number>(DEFAULT_BOOK_LIST_QUERY.paging.pageSize);
    sortBy = signal<SortBy>(DEFAULT_BOOK_LIST_QUERY.paging.sortBy);
    sortDir = signal<SortDir>(DEFAULT_BOOK_LIST_QUERY.paging.sortDir);
    selectedStatus = signal<BookStatus>(DEFAULT_BOOK_LIST_QUERY.bookStatus);
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
        bookStatus: this.selectedStatus(),
        keyword: this.keyword() || undefined,
    }));

    // 將 BookListQuery 組成  query string 並刷新本頁面
    private pushQuery(extra?: Partial<BookListQuery>) {
        const q = { ...this.querySig(), ...extra };
        this._router.navigate([], {
            relativeTo: this._route,
            queryParams: q,
            queryParamsHandling: '', // 覆寫
        });
    }


    // 僅由 ngOnInit() 呼叫
    // 將 BookListQuery 當成條件更新 bookList
    private loadList(query: BookListQuery) {
        this.loading.set(true);
        this.error.set(null);

        this._svc.getSellerBookList(query)
            .pipe(
                tap(() => this.loading.set(true,)),
                catchError(err => {
                    this.error.set('讀取失敗');
                    return of<SellerBookListItemDto[]>([]);
                })
            )
            .subscribe({
                next: list => {
                    this.bookList.set(list);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false),
            });
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this._route.queryParamMap.pipe(
            // 分解 query string
            map(pm => {
                const pageIndexStr = pm.get('pageIndex');
                const pageSizeStr = pm.get('pageSize');
                const fromUrl: BookListQuery = {
                    paging: {
                        pageIndex: Number(pageIndexStr) ?? DEFAULT_BOOK_LIST_QUERY.paging.pageIndex,
                        pageSize: Number(pageSizeStr) ?? DEFAULT_BOOK_LIST_QUERY.paging.pageSize,
                        sortBy: (pm.get('sortBy') as SortBy) ?? DEFAULT_BOOK_LIST_QUERY.paging.sortBy,
                        sortDir: (pm.get('sortDir') as SortDir) ?? DEFAULT_BOOK_LIST_QUERY.paging.sortDir,
                    },
                    bookStatus: (pm.get('bookStatus') as BookStatus) ?? DEFAULT_BOOK_LIST_QUERY.bookStatus,
                    keyword: pm.get('keyword') ?? undefined,
                };
                return fromUrl;
            }),
            distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            // 設置(更新) signal
            tap(q => {
                this.pageIndex.set(q.paging.pageIndex);
                this.pageSize.set(q.paging.pageSize);
                this.sortBy.set(q.paging.sortBy);
                this.sortDir.set(q.paging.sortDir);
                this.selectedStatus.set(q.bookStatus);
                this.keyword.set(q.keyword ?? undefined);
            }),
            // 手動觸發
            tap(q => this.loadList(q)),
        ).subscribe();
    }

    // ========== 事件 ==========

    // 篩選
    onStatus(status: BookStatus) {
        this.selectedStatus.set(status);
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
