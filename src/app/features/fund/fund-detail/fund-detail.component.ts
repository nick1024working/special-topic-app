import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, RouterModule, Router, NavigationEnd } from '@angular/router';
import { FundService } from '../fund.service';
import { FundProject } from '../models';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-fund-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, NgIf, NgFor],
    templateUrl: './fund-detail.component.html',
    styleUrls: ['./fund-detail.component.css']
})
export class FundDetailComponent implements OnInit {
    projectId!: number;
    // 詳細資料（配合你的 HTML 用 project() 取得）
    private _project = signal<FundProject | null>(null);
    project() { return this._project(); }

    constructor(private route: ActivatedRoute,
        private api: FundService,
        private fundSvc: FundService,
        private router: Router,
        public auth: AuthService) { this.projectId = +this.route.snapshot.paramMap.get('id')!; }

    ngOnInit(): void {
        this.route.paramMap.subscribe(pm => {
            const idStr = pm.get('id') ?? pm.get('projectId') ?? pm.get('donateProjectId');
            const id = Number(idStr);
            if (!Number.isFinite(id)) { this._project.set(null); return; }
            this.api.getProject(id).subscribe({
                next: p => this._project.set(this.normalizePaths(p)),
                error: _ => this._project.set(null)
            });
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        });
    }
    /** 把相對路徑補成以 / 開頭，讓 <img [src]> 能正確取到靜態檔 */
    private normalizePaths(p: FundProject): FundProject {
        const fix = (path?: string | null) => {
            if (!path) return path ?? undefined;
            if (path.startsWith('http') || path.startsWith('/')) return path;
            return '/' + path; // e.g. FundImages/123/abc.jpg -> /FundImages/123/abc.jpg
        };
        return {
            ...p,
            mainImagePath: fix(p.mainImagePath),
            gallery: p.gallery?.map(g => fix(g)!) ?? undefined
        };
    }

    /** 進度條百分比（0~100）— 你的 HTML 呼叫 percent() */
    percent(): number {
        const p = this._project();
        if (!p) return 0;
        const v = (p.currentAmount / Math.max(1, p.targetAmount)) * 100;
        return Math.min(100, Math.round(v));
    }

    /** 剩餘天數（endDate - 今天，向上取整）— 你的 HTML 呼叫 daysLeft() */
    daysLeft(): number {
        const p = this._project();
        if (!p) return 0;
        const end = new Date(p.endDate).getTime();
        const diff = end - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    /** 收藏：先做前端切換，之後若你有 API 再補呼叫 */
    toggleFavorite(): void {
        const p = this._project();
        if (!p) return;
        this._project.set({ ...p, isFavorite: !p.isFavorite });
        // TODO: 若後端要同步，這裡可呼叫 PATCH /api/fund/projects/{id}/favorite
    }

    /** 贊助：這裡先留空或導向你的贊助頁 */
    sponsor() {
        // 1) 需要登入
        const uid = this.auth.requireUidOrRedirect();
        if (!uid) return;

        // 2) 成交金額 & 付款方式視你的 UI 收集（這裡示範一個基本流程）
        const totalAmount = prompt('請輸入贊助金額（NT$）', '1000');
        if (!totalAmount || +totalAmount <= 0) return;

        const dto = {
            uid,
            donateProjectId: this.projectId,
            totalAmount: +totalAmount,
            paymentMethod: 'credit' // 你們的方式：credit｜atm｜...etc
        };

        this.fundSvc.createOrder(dto).subscribe({
            next: (res) => {
                alert(`贊助成功！訂單編號：${res.orderId}`);
                // TODO: 如需導到訂單明細頁再導頁
            },
            error: (err) => {
                alert(err?.error?.message ?? '贊助失敗');
            }
        });
    }
}
