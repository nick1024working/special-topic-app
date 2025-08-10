import { UsedBookAdminService } from './../../services/used-book-admin.service';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookStatus, SortBy, SortDir, BookListQuery, DEFAULT_BOOK_LIST_QUERY } from '../../dtos/book-list-query.dto';
import { environment } from '@env/environment';
import { AdminBookListItemDto } from '../../dtos/admin-book-list-item.dto';
import { buildQueryFromUrl } from '../../utils/book-list.query.mapper';

@Component({
    selector: 'app-ub-admin-book-list-page',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './admin-book-list-page.component.html',
    styleUrl: './admin-book-list-page.component.css'
})
export class AdminBookListPageComponent {

    CARD_PER_ROW = 100;

    // HACK: 直接不打 API 直接組後端 api.BaseUrl + coverUrl
    private readonly baseUrl = `${environment.apiBaseUrl}`;

    // DTO + UI model
    adminBookItemList: AdminBookListItemDto[] = [];

    // UI 狀態
    selectedStatus = signal<BookStatus>('all');
    sortBy = signal<SortBy>('updated');
    sortDir = signal<SortDir>('desc');
    keyword = '';

    constructor(
        private _svc: UsedBookAdminService,
        private activatedRoute: ActivatedRoute) { }


    ngOnInit(): void {
        const query: BookListQuery = buildQueryFromUrl(this.activatedRoute.snapshot.queryParamMap);
        this.fillList(query);
    }

    /** 使用當前 query 查詢 GetPublicBookList() */
    fillList(query: BookListQuery) {
        this._svc.getAdminBookList(query).subscribe({
            next: (res) => {
                this.adminBookItemList = res
                console.log(this.adminBookItemList);
            },
            error: (err) => console.error('取得管理員清單失敗', err),
        });
    }

    // ========== 底下先不實作 ==========

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


}
