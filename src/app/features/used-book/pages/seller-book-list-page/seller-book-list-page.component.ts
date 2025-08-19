import { UpdateStatusRequestDto } from './../../dtos/update-status-request.dto';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookStatus, SortBy, SortDir, BookListQuery } from '../../dtos/book-list-query.dto';
import { catchError, distinctUntilChanged, map, of, tap } from 'rxjs';
import { UsedBookService } from '../../services/used-book.service';
import { UsedBookSellerService } from '../../services/used-book-seller.service';
import { SellerBookListItemDto } from '../../dtos/seller-book-list-item.dto';

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
    private readonly destroyRef = inject(DestroyRef);

    // BookList 使用的
    bookList = signal<SellerBookListItemDto[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Filter 使用的
    selectedStatus = signal<BookStatus>('all');
    sortBy = signal<SortBy>('updated');
    sortDir = signal<SortDir>('desc');
    keyword = signal<string>('');

    // ========== 核心函數 ==========

    // 將目前 UI 狀態組成 BookListQuery
    private querySig = computed<BookListQuery>(() => ({
        bookStatus: this.selectedStatus(),
        keyword: this.keyword() || undefined,
        sortBy: this.sortBy(),
        sortDir: this.sortDir(),
        // TODO: page, pageSize
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
                const fromUrl: BookListQuery = {
                    bookStatus: (pm.get('bookStatus') as BookStatus) ?? 'all',
                    keyword: pm.get('keyword') ?? undefined,
                    sortBy: (pm.get('sortBy') as SortBy) ?? 'updated',
                    sortDir: (pm.get('sortDir') as SortDir) ?? 'desc',
                };
                return fromUrl;
            }),
            distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            // 設置(更新) signal
            tap(q => {
                this.selectedStatus.set(q.bookStatus);
                this.sortBy.set(q.sortBy);
                this.sortDir.set(q.sortDir);
                this.keyword.set(q.keyword ?? '');
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
    onDelete(id: string) {
        const request: UpdateStatusRequestDto = { value: false };
        this._bookSvc.deleteBook(id, request).subscribe({
            next: (res) => {
                console.log(res);
            }
        });
        this.pushQuery();
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
