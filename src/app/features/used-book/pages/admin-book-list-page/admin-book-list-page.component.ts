import { UpdateStatusRequestDto } from './../../dtos/update-status-request.dto';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { BookStatus, BookListQuery, DEFAULT_BOOK_LIST_QUERY } from '../../dtos/book-list-query.dto';
import { UsedBookAdminService } from '../../services/used-book-admin.service';
import { AdminBookListItemDto } from '../../dtos/admin-book-list-item.dto';
import { distinctUntilChanged, map, of, take, tap } from 'rxjs';
import { UsedBookService } from '../../services/used-book.service';
import { SortBy, SortDir } from '../../dtos/paging-query.dto';
import { buildPlainParams, buildQueryFromUrl } from '../../utils/book-list.query.mapper';
import { HttpParams } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LookupService } from '../../services/lookup.service';
import { IdNameDto } from '../../dtos/id-name.dto';
import { pageWindow } from '../../utils/pagination-helper';
import { UpdateBookSaleTagRequestDto } from '../../dtos/update-book-sale-tag-request.dto';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-ub-admin-book-list-page',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './admin-book-list-page.component.html',
    styleUrls: ['./admin-book-list-page.component.css', '../../styles/bs-custom-override.scss',],
})
export class AdminBookListPageComponent implements OnInit {
    private readonly adminSvc = inject(UsedBookAdminService);
    private readonly lookupSvc = inject(LookupService);
    private readonly bookSvc = inject(UsedBookService);
    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);

    // 資料容器
    bookList = signal<AdminBookListItemDto[]>([]);
    selectedSet = signal<Set<string>>(new Set());
    saleTagList = signal<IdNameDto[]>([]);

    // Computes
    readonly saleTags = computed(() => new Map(
        this.bookList().map(b => [b.id, b.saleTagList])
    ));
    readonly onPageBookIds = computed(() => this.bookList().map(b => b.id));
    readonly allOnPage = computed(() => {
        if (this.onPageBookIds().length === 0)
            return false;
        return this.onPageBookIds().every(id => this.selectedSet().has(id));
    });
    readonly someOnPage = computed(() => {
        if (this.onPageBookIds().length === 0)
            return false;
        let hit = 0;
        for (const id of this.onPageBookIds())
            if (this.selectedSet().has(id))
                hit++;
        return hit > 0 && hit < this.onPageBookIds().length;
    });

    // UI: Paging 用
    totalRows = signal<number>(0);
    totalPages = signal<number>(0);
    hasNextPage = signal<boolean>(false);
    readonly pageNoList = computed(() => pageWindow(this.pageIndex(), this.totalPages()));
    readonly allPageNoList = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

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
        this.router.navigate([], {
            relativeTo: this.activatedRoute,
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
        this.adminSvc.getAdminBookList(query).subscribe({
            next: (res) => {
                this.bookList.set(res.items);
                this.pageIndex.set(res.pageIndex + 1);
                this.pageSize.set(res.pageSize);
                this.totalRows.set(res.totalRows);
                this.totalPages.set(res.totalPages);
                this.hasNextPage.set(res.hasNextPage);
                console.log("[loadList,next]", res.pageIndex + 1);
            },
            error: (err) => console.error('[loadList]取得書本清單失敗', err),
        });
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this.lookupSvc.getSaleTagList().pipe(take(1)).subscribe({
            next: (res) => this.saleTagList.set(res),
            error: (err) => console.error("[ngOnInit]取得 saleTagList 失敗", err),
        });

        this.activatedRoute.queryParamMap.pipe(
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
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();
    }

    // ========== filter + sort 事件 ==========

    // 篩選
    onStatus(status: BookStatus) {
        this.bookStatus.set(status);
        this.pushQuery();
        this.clearSelectSet();
    }

    // 搜尋
    onSearch() {
        this.pushQuery();
        this.clearSelectSet();
    }

    // 排序
    onToggleSort(field: SortBy) {
        const dir: SortDir =
            this.sortBy() === field && this.sortDir() === 'asc' ? 'desc' : 'asc';
        this.sortBy.set(field);
        this.sortDir.set(dir);
        this.pushQuery();
    }

    onToggleActive(book: AdminBookListItemDto) {
        book.isActive = !book.isActive;
        let req: UpdateStatusRequestDto = { value: book.isActive };
        this.bookSvc.updateBookActiveStatus(book.id, req).subscribe();
    }

    // UI更新
    sortIcon(field: SortBy) {
        if (this.sortBy() !== field) return '↕';
        return this.sortDir() === 'asc' ? '↑' : '↓';
    }

    // UI更新
    statusLabel(s: BookStatus) {
        switch (s) {
            case 'inactive':
                return '禁用中書本';
            case 'unsold':
                return '未售出書本';
            case 'onshelf':
                return '上架中書本';
            case 'all':
                return '所有書本';
        }
    }

    // ========== 選擇 bookId 用 ==========

    onSelectAll() {
        const nextStatus = this.allOnPage() ? false : true;

        const next = new Set(this.selectedSet());

        for (const b of this.bookList()) {
            if (next.has(b.id) != nextStatus) {
                if (nextStatus)
                    next.add(b.id);
                else
                    next.delete(b.id);
            }
        }

        this.selectedSet.set(next);
    }

    onToggleSelect(id: string) {
        const next = new Set(this.selectedSet());

        if (next.has(id))
            next.delete(id);
        else
            next.add(id);

        this.selectedSet.set(next);
    }

    private clearSelectSet() {
        this.selectedSet.set(new Set());
    }

    // ========== 指派 saleTag 用 ==========

    onToggleTag(book: AdminBookListItemDto, tagId: number) {
        const idx = book.saleTagList.findIndex(t => t.id === tagId);
        if (idx === -1) {
            // 不存在，故新增
            const realTag = this.saleTagList().find(t => t.id === tagId);
            if (!realTag) return;
            book.saleTagList.push({ id: tagId, name: realTag.name, })
            this.bookSvc.applyBookSaleTag(book.id, tagId).subscribe({
                error: (err) => console.error("[onToggleTag]新增發生錯誤", err)
            });
        } else {
            book.saleTagList.splice(idx, 1);
            this.bookSvc.removeBookSaleTag(book.id, tagId).subscribe({
                error: (err) => console.error("[onToggleTag]移除發生錯誤", err)
            });
        }
    }

    hasTag(book: AdminBookListItemDto, tagId: number) {
        return book.saleTagList.some(t => t.id === tagId);
    }

    onApplyTagBatch(tagId: number) {
        const req: UpdateBookSaleTagRequestDto = {
            bookIdList: [...this.selectedSet()],
            tagId: tagId,
            isApply: true,
        }
        this.bookSvc.updateBookSaleTagBatch(req).subscribe({
            error: (err) => console.error("[onToggleTag]批次新增發生錯誤", err)
        });
    }

    onRemoveTagBatch(tagId: number) {
        const req: UpdateBookSaleTagRequestDto = {
            bookIdList: [...this.selectedSet()],
            tagId: tagId,
            isApply: false,
        }
        this.bookSvc.updateBookSaleTagBatch(req).subscribe({
            error: (err) => console.error("[onToggleTag]批次新增發生錯誤", err)
        });
    }


    // ========== Pagination ==========

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

    //** 接收來自 paging UI 的條件，並呼叫 pushQuery() */
    onPageChange(p: number) {
        this.pageIndex.set(p);
        this.pushQuery();
        this.scrollToTop();
    }

    // ========== 工具函數 ==========

    private scrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }
}
