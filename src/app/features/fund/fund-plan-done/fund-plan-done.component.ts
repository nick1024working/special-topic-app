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
                const pjImg = snap?.project?.imageUrl ?? m?.projectImageUrl ?? null;
                this.project = { title: pjTitle, mainImageUrl: pjImg };

                // 方案
                this.plan = {
                    title: String(it?.name ?? '募資方案'),
                    price: unit,
                    description: m?.description ?? '',
                    imageUrl: it?.imageUrl ?? null
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
                        // 可視回傳覆蓋：例如 o.projectTitle / o.planTitle / o.totalAmount...
                        // this.project = { title: o?.projectTitle ?? this.project?.title ?? '募資專案', mainImageUrl: this.project?.mainImageUrl ?? null };
                        // this.plan = { title: o?.planTitle ?? this.plan?.title ?? '募資方案', price: o?.unitPrice ?? this.plan?.price ?? 0, description: this.plan?.description, imageUrl: this.plan?.imageUrl };
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
