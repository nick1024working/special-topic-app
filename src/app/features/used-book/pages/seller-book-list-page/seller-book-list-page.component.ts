import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule  } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { SellerBookListItemDto } from '../../dtos/seller-book-list-item.dto';
import { BookStatus, SortBy, SortDir, BookListQuery, DEFAULT_BOOK_LIST_QUERY } from '../../dtos/book-list-query.dto';
import { UsedBookService } from '../../services/used-book.service';

@Component({
    selector: 'app-ub-seller-book-list-page',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './seller-book-list-page.component.html',
    styleUrls: ['./seller-book-list-page.component.css'],
})
export class SellerBookListPageComponent implements OnInit, OnDestroy {
    private svc = inject(UsedBookService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private destroy$ = new Subject<void>();

    // UI 狀態
    books = signal<SellerBookListItemDto[]>([]);
    selectedStatus = signal<BookStatus>('all');
    sortBy = signal<SortBy>('updated');
    sortDir = signal<SortDir>('desc');
    keyword = '';

    ngOnInit(): void {
    }

    // 篩選
    onStatus(status: BookStatus) {
        this.selectedStatus.set(status);
        // this.pushQuery({ page: 1 });
    }

    // 搜尋
    onSearch(e: Event) {
        e.preventDefault();
        // this.pushQuery({ page: 1 });
    }

    // 排序
    onToggleSort(field: SortBy) {
        const dir: SortDir =
            this.sortBy() === field && this.sortDir() === 'asc' ? 'desc' : 'asc';
        this.sortBy.set(field);
        this.sortDir.set(dir);
        // this.pushQuery({ page: 1 });
    }

    sortIcon(field: SortBy) {
        if (this.sortBy() !== field) return '↕';
        return this.sortDir() === 'asc' ? '↑' : '↓';
    }

    statusLabel(s: BookStatus) {
        return s === 'all' ? '所有書本' : s === 'onshelf' ? '上架中書本' : '未售出書本';
    }

    private pushQuery(extra?: Partial<BookListQuery>) {
        const query: BookListQuery = {
            bookStatus: this.selectedStatus(),
            keyword: this.keyword || undefined,
            sortBy: this.sortBy(),
            sortDir: this.sortDir(),
            // page: extra?.page ?? 1,
            // pageSize: extra?.pageSize ?? 20,
        };
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: query,
            queryParamsHandling: '', // 覆寫
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
