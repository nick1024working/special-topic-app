import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { FundService } from '../fund.service'; // ← 依你的實際路徑調整

// ──────────────────────────────────────────────────────────
// View Models（只給前端使用的展示欄位）
export type ProposalVm = {
    id: number;
    title: string;
    imageUrl?: string | null;
    statusText?: string;
    createdAt?: string | Date;
    raisedAmount?: number;
    targetAmount?: number;
};

export type SponsorVm = {
    orderId: number;
    projectTitle: string;
    projectImageUrl?: string | null;
    planTitle?: string;
    totalAmount: number;
    quantity?: number;
    paymentStatusText?: string;
    createdAt?: string | Date;
    canRepay?: boolean;
};
// ──────────────────────────────────────────────────────────

@Component({
    selector: 'app-my-fund',
    standalone: true,
    imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
    templateUrl: './my-fund.component.html'
})
export class MyFundComponent {
    private fundSvc = inject(FundService);
    private router = inject(Router);

    loading = true;
    errorMsg = '';

    // tabs: 'proposal'=我的提案 / 'sponsor'=我的贊助
    activeTab: 'proposal' | 'sponsor' = 'proposal';

    myProposals: ProposalVm[] = [];
    mySponsorships: SponsorVm[] = [];

    ngOnInit(): void {
        this.loadAll();
    }

    // 讀取兩邊資料
    private loadAll(): void {
        this.loading = true;
        this.errorMsg = '';

        forkJoin({
            proposals: this.fundSvc.getMyProposals().pipe(
                catchError(err => {
                    console.error('[MyFund] getMyProposals error', err);
                    // 不中斷：空陣列回傳給 UI
                    return of([]);
                })
            ),
            orders: this.fundSvc.getMySponsorships().pipe(
                catchError(err => {
                    console.error('[MyFund] getMySponsorships error', err);
                    return of([]);
                })
            )
        })
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: ({ proposals, orders }: any) => {
                    // 後端欄位名稱各隊會不同 → 做一層映射成前端 VM
                    this.myProposals = (proposals ?? []).map((p: any): ProposalVm => ({
                        id: Number(p?.id ?? p?.projectId ?? 0),
                        title: String(p?.title ?? p?.projectTitle ?? '未命名專案'),
                        imageUrl: p?.mainImageUrl ?? p?.imageUrl ?? null,
                        statusText: p?.statusText ?? p?.status ?? '',
                        createdAt: p?.createdAt ?? p?.createTime ?? null,
                        raisedAmount: Number(p?.raisedAmount ?? p?.currentAmount ?? 0),
                        targetAmount: Number(p?.targetAmount ?? p?.goalAmount ?? 0),
                    }));

                    this.mySponsorships = (orders ?? []).map((o: any): SponsorVm => {
                        const status = String(o?.paymentStatusText ?? o?.statusText ?? o?.status ?? '');
                        const canRepay = !/paid|success|已付款|完成/i.test(status);
                        return {
                            orderId: Number(o?.orderId ?? o?.id ?? 0),
                            projectTitle: String(o?.projectTitle ?? '（未取得專案名稱）'),
                            projectImageUrl: o?.projectImageUrl ?? o?.imageUrl ?? null,
                            planTitle: o?.planTitle ?? o?.donatePlanTitle ?? o?.plan?.title ?? '',
                            totalAmount: Number(o?.totalAmount ?? o?.amount ?? 0),
                            quantity: Number(o?.quantity ?? 1),
                            paymentStatusText: status,
                            createdAt: o?.createdAt ?? o?.createTime ?? null,
                            canRepay
                        };
                    });
                },
                error: (err) => {
                    console.error('[MyFund] loadAll fatal', err);
                    this.errorMsg = '載入失敗，請稍後再試';
                }
            });
    }

    // 切換分頁
    switchTab(tab: 'proposal' | 'sponsor'): void {
        this.activeTab = tab;
    }

    // 專案管理（依你站上的實際路由調整）
    manageProject(projectId: number): void {
        if (!projectId) return;
        // 常見做法之一：
        this.router.navigate(['/fund/project', projectId, 'manage']);
        // 若你是 /fund/edit/:id → 改成 this.router.navigate(['/fund/edit', projectId]);
    }

    // 查看訂單（導去你現有的 done/明細頁；若有專屬訂單頁，自行換路由）
    viewOrder(orderId: number): void {
        if (!orderId) return;
        // 你目前的明細頁是 fund-plan-done（以 query 參數接 orderId）
        this.router.navigateByUrl(`/fund/fund-plan-done?orderId=${orderId}&code=OK`);
    }

    // 重新付款（呼叫既有的 LINE Pay 付款 API）
    repay(orderId: number): void {
        if (!orderId) return;
        this.fundSvc.payFundOrder(orderId).subscribe({
            next: (res: any) => {
                const url = res?.url;
                if (!url) { alert('初始化付款失敗'); return; }
                // 直接導轉至 LINE Pay
                window.location.href = url;
            },
            error: (err) => {
                console.error('[MyFund] repay error', err);
                const msg = (typeof err?.error === 'string' && err.error)
                    || err?.error?.detail
                    || '重新付款失敗，請稍後再試';
                alert(msg);
            }
        });
    }

    // 圖片失敗 fallback
    onImgError(e: Event): void {
        (e.target as HTMLImageElement).src = 'assets/images/default.png';
    }
}
