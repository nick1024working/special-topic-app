import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { FundService } from '../fund.service'; // 依實際路徑

@Component({
    selector: 'app-fund-plan-done',
    standalone: true,
    imports: [DecimalPipe, CommonModule],
    templateUrl: './fund-plan-done.component.html'
})
export class FundPlanDoneComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private fundSvc = inject(FundService);

    loading = true;
    errorMsg = '';

    orderId?: number;

    project?: { title: string; mainImageUrl?: string | null };
    plan?: { title: string; price: number; description?: string; imageUrl?: string | null };
    qty = 1;
    total = 0;

    // 顯示：訂購人/收件資訊
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    receiverName?: string;
    receiverPhone?: string;
    fullAddress?: string;

    ngOnInit(): void {
        const qp = this.route.snapshot.queryParamMap;
        this.orderId = Number(qp.get('orderId') || 0);
        const code = (qp.get('code') || '').toString();

        // 1) 失敗 / 取消
        if (code && code !== '0000' && code.toUpperCase() !== 'OK') {
            this.loading = false;
            this.errorMsg = (code === 'CANCEL') ? '您已取消付款' : `付款確認失敗（${code}）`;
            return;
        }

        // 2) 先用快照渲染（有的話）
        const raw = sessionStorage.getItem('fund_checkout_snapshot');
        if (raw) {
            try {
                const snap = JSON.parse(raw) || {};
                const it: any = (snap.items ?? [])[0] ?? {};
                const m: any = it.meta ?? {};

                this.qty = Number(snap?.totals?.qty ?? it.quantity ?? 1);
                const unit = Number(it.unitPrice ?? 0);
                this.total = Number(snap?.totals?.amount ?? unit * this.qty);

                // 專案（用 snapshot.project → item.meta，最後給預設字串，避免 falsy）
                const pjTitle = snap?.project?.title ?? m?.projectTitle ?? '募資專案';
                const pjImgCandidate =
                    snap?.project?.imageUrl ??
                    snap?.project?.imagePath ??
                    m?.projectImageUrl ??
                    m?.projectImagePath ??
                    m?.projectMainImagePath ??
                    null;
                this.project = {
                    title: pjTitle,
                    mainImageUrl: pjImgCandidate ? this.fundSvc.imageUrl(pjImgCandidate) : null
                };

                // 方案
                const planImgCandidate =
                    it?.imageUrl ??
                    it?.imagePath ??
                    m?.planImageUrl ??
                    m?.planImagePath ??
                    null;

                this.plan = {
                    title: String(it?.name ?? '募資方案'),
                    price: unit,
                    description: m?.description ?? '',
                    imageUrl: planImgCandidate ? this.fundSvc.imageUrl(planImgCandidate) : null
                };

                // 訂購人 / 收件
                this.customerName = snap?.customer?.name ?? '';
                this.customerEmail = snap?.customer?.email ?? '';
                this.customerPhone = snap?.customer?.phone ?? '';
                this.receiverName = snap?.shipping?.name ?? '';
                this.receiverPhone = snap?.shipping?.phone ?? '';
                this.fullAddress = snap?.shipping?.address ?? '';
            } catch { /* ignore */ }
        }

        // 3) 若有 orderId 再打 API（成功與否都 finalize 關掉 loading）
        if (this.orderId && this.orderId > 0) {
            this.fundSvc.getFundOrder(this.orderId)
                .pipe(finalize(() => {
                    this.loading = false;
                    sessionStorage.removeItem('fund_checkout_snapshot');
                }))
                .subscribe({
                    next: (o: any) => {
                        if (o?.totalAmount != null) this.total = Number(o.totalAmount);
                        if (o?.quantity != null) this.qty = Number(o.quantity);
                        const unitFromOrder = Number(o?.unitPrice ?? o?.price ?? NaN);
                        if (!Number.isNaN(unitFromOrder) && !o?.totalAmount) {
                            this.total = unitFromOrder * this.qty;
                        }

                        // 專案圖片：優先保留已有的，否則用後端欄位補上
                        const projImgFromOrder =
                            o?.projectImageUrl ??
                            o?.projectImagePath ??
                            o?.projectMainImagePath ??
                            null;
                        if (projImgFromOrder && (!this.project || !this.project.mainImageUrl)) {
                            this.project = {
                                title: o?.projectTitle ?? this.project?.title ?? '募資專案',
                                mainImageUrl: this.fundSvc.imageUrl(projImgFromOrder)
                            };
                        }

                        // 方案圖片：同樣優先保留已有的，否則補上
                        const planImgFromOrder =
                            o?.planImageUrl ??
                            o?.planImagePath ??
                            o?.imagePath ??
                            null;
                        if (planImgFromOrder && (!this.plan || !this.plan.imageUrl)) {
                            this.plan = {
                                title: o?.planTitle ?? this.plan?.title ?? '募資方案',
                                price: this.plan?.price ?? Number(o?.unitPrice ?? 0),
                                description: this.plan?.description ?? o?.planDescription ?? '',
                                imageUrl: this.fundSvc.imageUrl(planImgFromOrder)
                            };
                        }
                    },
                    error: _ => { /* ignore，畫面已靠快照顯示 */ }
                });
        } else {
            this.loading = false;
            sessionStorage.removeItem('fund_checkout_snapshot');
        }
    }

    backToAll() { this.router.navigateByUrl('/fund'); }
    goMyFundSponsor(): void {
        this.router.navigate(['/fund/my-fund'], { queryParams: { tab: 'sponsor' } });
    }
    onProjectImgError(e: Event) { (e.target as HTMLImageElement).src = 'assets/images/default.png'; }
    onPlanImgError(e: Event) { (e.target as HTMLImageElement).src = 'assets/images/default.png'; }
}
