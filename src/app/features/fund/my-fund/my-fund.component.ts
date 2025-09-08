import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { FundService } from '../fund.service';

type TabKey = 'proposal' | 'sponsor';

export type ProposalVm = {
    id: number;
    title: string;
    imageUrl?: string | null;
    statusText?: string;
    createdAt?: string | Date | null;
    raisedAmount?: number;
    targetAmount?: number;
};

export type SponsorVm = {
    orderId: number;
    projectId?: number | null;        // ★ 用來補專案名稱
    projectTitle: string;
    projectImageUrl?: string | null;
    planTitle?: string;
    totalAmount: number;
    quantity?: number;
    paymentMethodText?: string;
    paymentStatusText?: string;
    createdAt?: string | Date | null;
    paidAt?: string | Date | null;
    displayDate?: string | Date | null;
    canRepay?: boolean;
};

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
    activeTab: TabKey = 'proposal';

    myProposals: ProposalVm[] = [];
    mySponsorships: SponsorVm[] = [];

    private readonly DONE_PATH = '/fund/fund-plan-done';

    ngOnInit() {
        this.loadAll();
    }

    // =============== UI handlers ===============
    switchTab(tab: TabKey) {
        if (this.activeTab === tab) return;
        this.activeTab = tab;

        if (tab === 'proposal' && this.myProposals.length === 0) {
            this.loading = true;
            this.fetchProposals().pipe(finalize(() => (this.loading = false))).subscribe();
        }
        if (tab === 'sponsor' && this.mySponsorships.length === 0) {
            this.loading = true;
            this.fetchSponsorships().pipe(finalize(() => (this.loading = false))).subscribe();
        }
    }


    viewOrder(orderId: number) {
        this.router.navigateByUrl(`${this.DONE_PATH}?orderId=${orderId}&code=OK`);
    }

    repay(orderId: number) {
        this.fundSvc.payFundOrder(orderId).subscribe({
            next: (res: any) => {
                const url = res?.url;
                if (!url) { alert('初始化付款失敗'); return; }
                window.location.href = url;
            },
            error: (err: HttpErrorResponse) => {
                console.error('[repay] error', err);
                const detail = err?.error?.detail;
                const statusLine = `${err?.status ?? ''} ${err?.statusText ?? ''}`.trim();
                const msg = detail ?? (statusLine || '重新付款失敗');
                alert(msg);
            }
        });
    }

    onImgError(evt: Event) {
        (evt.target as HTMLImageElement).src = 'assets/images/default.png';
    }

    // =============== data loaders ===============
    private loadAll() {
        this.loading = true;
        this.fetchProposals()
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: () => this.fetchSponsorships().subscribe(),
                error: () => this.fetchSponsorships().subscribe()
            });
    }

    /** 讀「我的提案」：後端沒有 /mine，就打 /api/fund/FundProjects */
    private fetchProposals(): Observable<void> {
        return new Observable<void>((subscriber) => {
            this.fundSvc.getMyProposals().subscribe({
                next: (rows: any[]) => {
                    // rows 可能是陣列或 { items: [...] }，service 已處理成陣列
                    this.myProposals = (rows ?? []).map((r) => {
                        const status = (r?.status ?? r?.statusText ?? '').toString().toUpperCase();
                        const vm: ProposalVm = {
                            id: Number(r?.id ?? r?.projectId ?? 0),
                            title: String(r?.title ?? r?.projectTitle ?? '未命名專案'),
                            imageUrl: r?.mainImageUrl ?? r?.imageUrl ?? r?.coverUrl ?? null,
                            statusText: r?.statusText ?? this.statusToText(status),
                            createdAt: r?.createdAt ?? r?.createdOn ?? r?.createTime ?? null,
                            raisedAmount: Number(r?.raisedAmount ?? r?.totalRaised ?? r?.currentAmount ?? 0),
                            targetAmount: Number(r?.targetAmount ?? r?.goal ?? r?.target ?? 0),
                        };
                        return vm;
                    });
                    subscriber.next();
                    subscriber.complete();
                },
                error: (err: HttpErrorResponse) => {
                    console.error('[fetchProposals] error', err);
                    this.errorMsg ||= '讀取我的提案失敗';
                    subscriber.error(err);
                }
            });
        });
    }

    private fetchSponsorships(): Observable<void> {
        return new Observable<void>((sub) => {
            this.fundSvc.getMySponsorships().subscribe({
                next: (rows: any[]) => {
                    this.mySponsorships = (rows ?? []).map(r => {
                        // 後端現在直接給：orderId, projectId/planId, planTitle, projectTitle, projectMainImageUrl
                        const vm: SponsorVm = {
                            orderId: Number(r?.donateOrderId ?? r?.orderId ?? 0),
                            projectId: Number(r?.donateProjectId ?? r?.projectId ?? 0) || null,
                            planTitle: r?.planTitle ?? '',
                            projectTitle: r?.projectTitle ?? '',
                            totalAmount: Number(r?.totalAmount ?? 0),
                            quantity: Number(r?.quantity ?? 1),
                            paymentMethodText: this.methodToText((r?.paymentMethod ?? '').toString().toUpperCase()),
                            paymentStatusText: r?.paymentDate ? '已付款' : '未付款',
                            createdAt: r?.orderCreatedAt ?? null,
                            paidAt: r?.paymentDate ?? null
                        };
                        vm.displayDate = vm.paidAt || vm.createdAt;
                        return vm;
                    });
                    sub.next(); sub.complete();
                },
                error: (err) => { this.errorMsg ||= '讀取我的贊助失敗'; sub.error(err); }
            });
        });
    }

    // =============== helpers ===============
    private statusToText(code: string): string {
        const c = (code || '').toString().toUpperCase();
        switch (c) {
            case 'PAID': return '已付款';
            case 'UNPAID': return '未付款';
            case 'PENDING': return '處理中';
            case 'FAILED': return '失敗';
            case 'CANCELED':
            case 'CANCELLED': return '已取消';
            default: return code || '';
        }
    }

    private methodToText(code: string): string {
        const c = (code || '').toString().toUpperCase();
        switch (c) {
            case 'LINEPAY': return 'LINE Pay';
            case 'CREDIT':
            case 'CREDITCARD': return '信用卡';
            case 'ATM': return 'ATM 轉帳';
            case 'FACE2FACE':
            case 'FACETOFACE': return '面交';
            default: return code || '';
        }
    }
}
