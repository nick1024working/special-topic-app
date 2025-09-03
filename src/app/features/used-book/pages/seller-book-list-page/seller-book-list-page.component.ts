import { UpdateStatusRequestDto } from './../../dtos/update-status-request.dto';
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
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
    styleUrls: ['./seller-book-list-page.component.css', '../../styles/bs-custom-override.scss',]
})
export class SellerBookListPageComponent implements OnInit {
    private readonly sellerSvc = inject(UsedBookSellerService);
    private readonly bookSvc = inject(UsedBookService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);

    // 資料容器
    bookList = signal<SellerBookListItemDto[]>([]);

    // 大量上傳用
    selectedFile?: File;
    @ViewChild('importModal') importModal!: ElementRef<HTMLDivElement>;
    private modal?: any;

    // Filter 使用的
    pageIndex = signal<number>(DEFAULT_BOOK_LIST_QUERY.paging.pageIndex);
    pageSize = signal<number>(DEFAULT_BOOK_LIST_QUERY.paging.pageSize);
    sortBy = signal<SortBy>(DEFAULT_BOOK_LIST_QUERY.paging.sortBy);
    sortDir = signal<SortDir>(DEFAULT_BOOK_LIST_QUERY.paging.sortDir);
    bookStatus = signal<BookStatus>(DEFAULT_BOOK_LIST_QUERY.bookStatus);
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
    private pushQuery(forceRefresh = false) {
        const plain = buildPlainParams(this.querySig());

        const withRev = forceRefresh
            ? { ...plain, _rev: Date.now().toString() }
            : plain;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: withRev,
            queryParamsHandling: '',
        });
    }

    /** 返回正規化後的 query-string */
    private canon(pm: ParamMap) {
        const pairs = pm.keys.sort().flatMap(k => pm.getAll(k).map(v => [k, v] as const));
        const params = new HttpParams({ fromObject: Object.fromEntries(pairs) });
        return params.toString();
    };

    // 將 BookListQuery 當成條件更新 bookList
    private loadList(query: BookListQuery = DEFAULT_BOOK_LIST_QUERY) {
        this.sellerSvc.getSellerBookList(query).subscribe({
            next: (res) => this.bookList.set(res),
            error: (err) => console.error('[loadList]取得書本清單失敗', err),
        });
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this.scrollToTop();
        this.route.queryParamMap.pipe(
            map(pm => ({ canon: this.canon(pm), q: buildQueryFromUrl(pm) })),
            distinctUntilChanged((a, b) => a.canon === b.canon),
            tap(({ q }) => {
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

    ngAfterViewInit() {
        this.modal = bootstrap.Modal.getOrCreateInstance(this.importModal.nativeElement);
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

    onToggleOnShelf(b: SellerBookListItemDto) {
        b.isOnShelf = !b.isOnShelf;
        let req: UpdateStatusRequestDto = { value: b.isOnShelf };
        this.bookSvc.updateBookOnShelfStatus(b.id, req).subscribe();
    }


    onDelete(b: SellerBookListItemDto) {
        const request: UpdateStatusRequestDto = { value: false };
        this.bookSvc.updateBookActiveStatus(b.id, request).subscribe({
            next: () => this.pushQuery(true),
        });
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

    onDownloadTemplate() {
        this.bookSvc.exportUploadExample().subscribe(blob => {
            const filename = '大量匯入範例.xlsx';

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
        });
    }

    onFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        this.selectedFile = input.files?.[0] ?? undefined;
    }

    onImport() {
        if (!this.selectedFile) return;
        this.bookSvc.importBooks(this.selectedFile).subscribe({
            next: () => {
                // TODO: 可增加功能
                this.modal?.hide();
                this.loadList();
            },
            error: (err) => {
                // TODO: 顯示錯誤
                console.error(err);
            }
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }
}
