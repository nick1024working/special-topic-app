import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { FundService } from '../fund.service';

type TabKey = 'proposal' | 'sponsor';

export type ProposalVm = {
    id: number;
    title: string;
    imageUrl?: string | null;
    statusText?: string | null;
    createdAt?: string | Date | null;
    raisedAmount?: number;
    targetAmount?: number;
    status?: string | null;
    isDeleted?: boolean | null;
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
    private route = inject(ActivatedRoute);

    loading = true;
    errorMsg = '';
    activeTab: TabKey = 'proposal';

    myProposals: ProposalVm[] = [];
    mySponsorships: SponsorVm[] = [];

    private readonly DONE_PATH = '/fund/fund-plan-done';

    ngOnInit() {
        // 讀取 ?tab= 與 ?p=（若你已經有 tab 訂閱，直接把 p 的部分合併進去即可）
        this.route.queryParamMap.subscribe(params => {
            const p = Number(params.get('p') ?? 1);
            this.pageIndexProposal = Number.isFinite(p) && p > 0 ? p : 1;

            const tab = (params.get('tab') || '').toLowerCase();
            if (tab === 'proposal' || tab === 'sponsor') this.activeTab = tab as any;
        });

        this.loadAll();
        const qp = this.route.snapshot.queryParamMap;
        if (!qp.has('p')) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { p: this.pageIndexProposal },
                queryParamsHandling: 'merge',
                replaceUrl: true
            });
        }
    }

    // =============== UI handlers ===============
    switchTab(tab: 'proposal' | 'sponsor') {
        if (this.activeTab === tab) return;
        this.activeTab = tab;

        if (tab === 'proposal') {
            if (this.myProposals.length === 0) {
                this.loading = true;
                this.fetchProposals()
                    .pipe(finalize(() => (this.loading = false)))
                    .subscribe(() => {
                        // 載入完成後校正頁碼
                        if (this.pageIndexProposal > this.totalProposalPages) this.pageIndexProposal = 1;
                    });
            } else {
                if (this.pageIndexProposal > this.totalProposalPages) this.pageIndexProposal = 1;
            }
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

    private fetchProposals(): Observable<void> {
        return new Observable<void>((subscriber) => {
            this.fundSvc.getMyProposals().subscribe({
                next: (rows: any[]) => {
                    // rows 可能是陣列或 { items: [...] }，service 已處理成陣列
                    this.myProposals = (rows ?? []).map((r: any) => {
                        const isDel = !!(r?.isDeleted ?? r?.IsDeleted);
                        const statusRaw: string = String(r?.status ?? r?.Status ?? r?.statusText ?? '');
                        const vm: ProposalVm = {
                            id: Number(r?.donateProjectId ?? r?.DonateProjectId ?? r?.id ?? r?.projectId ?? 0),
                            title: String(r?.title ?? r?.projectTitle ?? '未命名專案'),
                            imageUrl: this.fundSvc.imageUrl(r?.mainImagePath ?? r?.mainImageUrl ?? r?.imageUrl ?? r?.coverUrl ?? null),
                            status: statusRaw || (isDel ? '已下架' : '募資中'),
                            statusText: isDel ? '已下架' : ((r?.statusText ?? statusRaw) || '募資中'),
                            isDeleted: isDel,
                            createdAt: forceUtcToDate(r?.createdAt ?? r?.CreatedAt ?? r?.created_at ?? null),
                            raisedAmount: Number(r?.raisedAmount ?? r?.totalRaised ?? r?.currentAmount ?? 0),
                            targetAmount: Number(r?.targetAmount ?? r?.goal ?? r?.target ?? 0),
                        };
                        return vm;
                    });

                    // ✅ 校正目前頁碼，不要超出範圍（也避免小於 1）
                    const total = this.totalProposalPages;
                    if (this.pageIndexProposal > total) this.pageIndexProposal = total;
                    if (this.pageIndexProposal < 1) this.pageIndexProposal = 1;

                    // ✅ 重新產生分頁數字
                    this.recomputeProposalPages();

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

                        const created = toLocalDate(r?.orderCreatedAt ?? r?.createdAt ?? null);
                        const paid = toLocalDate(r?.paymentDate ?? r?.paidAt ?? null);
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
                            createdAt: forceUtcToDate(r.createdAt ?? r.CreatedAt ?? r.created_at ?? null),
                            paidAt: paid,
                            displayDate: paid ?? created
                        };
                        return vm;
                    });
                    sub.next(); sub.complete();
                },
                error: (err) => { this.errorMsg ||= '讀取我的贊助失敗'; sub.error(err); }
            });
        });
    }

    isBusy = false;

    confirmSoftDelete(p: ProposalVm) {
        const id = Number(p?.id);
        if (!id) { alert('找不到此提案的 id，無法下架'); return; }

        const ok = window.confirm(`確定要下架「${p.title}」嗎？下架後將不會出現在所有專案列表，但你仍可在「我的提案」檢視。`);
        if (!ok) return;

        this.isBusy = true;
        this.fundSvc.softDeleteProject(id).subscribe({
            next: () => {
                p.isDeleted = true;
                p.status = '已下架';
                p.statusText = '已下架';
                this.isBusy = false;
            },
            error: (err: HttpErrorResponse) => {
                console.error('[softDeleteProject] error', err);
                this.isBusy = false;
                const status = `${err.status ?? ''} ${err.statusText ?? ''}`.trim();
                alert(status ? `下架失敗：${status}` : '下架失敗，請稍後再試。');
            }
        });
    }

    confirmRestore(p: ProposalVm) {
        const id = Number(p?.id);
        if (!id) { alert('找不到此提案的 id，無法重新上架'); return; }
        if (!window.confirm(`要重新上架「${p.title}」嗎？`)) return;

        this.isBusy = true;
        this.fundSvc.restoreProject(id).subscribe({
            next: () => {
                p.isDeleted = false;
                p.status = '募資中';     // ← 一併設回 status
                p.statusText = '募資中';
                this.isBusy = false;
            },
            error: (err) => { console.error(err); this.isBusy = false; alert('重新上架失敗'); }
        });
    }

    pageSizeProposal = 12;
    pageIndexProposal = 1;
    proposalPages: number[] = [];

    get pagedProposals() {
        const start = (this.pageIndexProposal - 1) * this.pageSizeProposal;
        return this.myProposals.slice(start, start + this.pageSizeProposal);
    }

    get totalProposalPages(): number {
        return Math.max(1, Math.ceil(this.myProposals.length / this.pageSizeProposal));
    }

    private recomputeProposalPages() {
        this.proposalPages = Array.from({ length: this.totalProposalPages }, (_, i) => i + 1);
    }

    gotoProposalPage(p: number) {
        if (p < 1 || p > this.totalProposalPages) return;
        this.pageIndexProposal = p;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { tab: this.activeTab, p },
            queryParamsHandling: 'merge'
        });
    }


    // =============== helpers ===============

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
function toLocalDate(x: any): Date | null {
    if (!x) return null;
    if (x instanceof Date) return x;
    if (typeof x === 'number') {
        const d = new Date(x);
        return isNaN(d.getTime()) ? null : d;
    }
    const s = String(x).trim();
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}

function forceUtcToDate(x: string | Date | null | undefined): Date | null {
    if (!x) return null;
    if (x instanceof Date) return x;
    const s = String(x).trim();

    // 只有日期：YYYY-MM-DD -> 視為 UTC 午夜
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00Z');

    // ISO 但沒時區：補 Z 當 UTC
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(s) && !/[zZ]|[+\-]\d{2}:\d{2}$/.test(s)) {
        return new Date(s + 'Z');
    }

    // 其餘交給原生 Date（含 ...Z / +00:00）
    return new Date(s);
}
