import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FundService } from '../fund.service';
import { FundProject, FundCategory, PagedResult } from '../models';

@Component({
    selector: 'app-fund-project',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './fund-project.component.html',
})
export class FundProjectComponent implements OnInit {

    // 下拉選單資料
    categories: FundCategory[] = [];

    // 目前選中的分類 (null = 全部)
    selectedCategory: number | null = null;

    // 專案清單與分頁
    projects: FundProject[] = [];
    total = 0;
    page = 1;
    pageSize = 24;

    // 關鍵字搜尋
    searchText = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fundSvc: FundService,
    ) { }

    ngOnInit(): void {
        // 先載入分類 (給下拉選單)
        this.loadCategories();

        // 監聽 query string，帶著 categoryId 來就直接套用
        this.route.queryParamMap.subscribe(p => {
            const cid = p.get('categoryId');
            // 把字串轉成 number；若沒有帶就設為 null (代表全部)
            this.selectedCategory = cid !== null ? Number(cid) : null;
            this.page = Number(p.get('page') ?? 1);
            this.loadProjects(); // 套用完分類後重新查詢
        });
    }

    // 讀分類
    private loadCategories(): void {
        this.fundSvc.getCategories().subscribe(list => {
            this.categories = list ?? [];
        });
    }

    // 讀專案
    private loadProjects(): void {
        const params: any = {
            page: this.page,
            pageSize: this.pageSize,
            categoryId: this.selectedCategory ?? undefined,
            keyword: this.searchText?.trim() || undefined
            // 如你的 API 還支援 status，可加上：status: '募資中'
        };

        this.fundSvc.getProjects(params).subscribe((res: any) => {
            // 可能是 { items, total }，也可能直接是 FundProject[]
            const items: FundProject[] = Array.isArray(res) ? res : (res?.items ?? []);
            this.projects = items;
            this.total = Array.isArray(res) ? items.length : (res?.total ?? items.length);
        });
    }

    // 下拉選單變更
    onCategoryChange(val: number | null): void {
        this.selectedCategory = val;
        // 同步到網址列，並把頁碼回到 1
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                categoryId: this.selectedCategory ?? null,
                page: 1
            },
            queryParamsHandling: 'merge'
        });
        this.page = 1;
        this.loadProjects();
    }

    // 關鍵字搜尋
    onSearch(): void {
        this.page = 1;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                keyword: this.searchText?.trim() || null,
                page: 1
            },
            queryParamsHandling: 'merge'
        });
        this.loadProjects();
    }

    // 進度條 / 標籤用的工具函式（保持你原本樣式）
    getProgressPercent(p: FundProject): number {
        const t = p.targetAmount || 0;
        const c = p.currentAmount || 0;
        return t > 0 ? Math.min(100, Math.round((c / t) * 100)) : 0;
    }

    // 剩餘天數
    getDaysLeft(endDate: string | Date | null | undefined): number {
        if (!endDate) return 0;
        const end = new Date(endDate);
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        return Math.max(0, Math.ceil((end.getTime() - start) / 86400000));
    }

    // 前往詳情
    goToDetail(id: number): void {
        this.router.navigate(['/', 'fund', 'fund-detail', id]);
    }
    // 搜尋事件
    onSearchTerm(keyword: string): void {
        this.searchText = (keyword ?? '').trim();
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { q: this.searchText || null, page: 1 },
            queryParamsHandling: 'merge'
        });
    }
}
