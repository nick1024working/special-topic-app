import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FundService } from '../fund.service';
import { finalize, take } from 'rxjs/operators';

@Component({
    selector: 'app-fund-plan-done',
    standalone: true,                 // ← 若你是 NgModule 方案就拿掉這行與 imports！
    imports: [CommonModule, RouterModule, DecimalPipe],
    templateUrl: './fund-plan-done.component.html',
})
export class FundPlanDoneComponent implements OnInit {
    loading = true;
    errorMsg: string | null = null;

    project: any = null;  // { id, title, mainImageUrl }
    plan: any = null;     // { id, title, price, description, imageUrl }
    qty = 1;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fund: FundService
    ) { }

    ngOnInit(): void {
        const projectId = Number(this.route.snapshot.paramMap.get('projectId'));
        const planId = Number(this.route.snapshot.paramMap.get('planId'));
        const q = Number(this.route.snapshot.queryParamMap.get('qty') ?? '1');
        this.qty = !isNaN(q) && q > 0 ? q : 1;

        // 先吃導向時帶來的快照（有就先顯示）
        const nav: any = history.state ?? {};
        if (nav?.projectSnapshot?.title) {
            this.project = {
                id: projectId,
                title: nav.projectSnapshot.title,
                mainImageUrl: null
            };
        }
        if (nav?.planSnapshot?.id) {
            this.plan = {
                id: Number(nav.planSnapshot.id),
                title: nav.planSnapshot.title ?? '',
                price: Number(nav.planSnapshot.price ?? 0),
                description: nav.planSnapshot.description ?? '',
                imageUrl: nav.planSnapshot.imageUrl ?? null
            };
        }

        // 若 projectId/planId 不合法，直接顯錯
        if (!Number.isFinite(projectId) || !Number.isFinite(planId)) {
            this.loading = false;
            this.errorMsg = '路由參數有誤（缺少 projectId 或 planId）。';
            return;
        }

        // 背景抓詳情，補齊資料；找不到也不要導回
        this.fund.getProjectById(projectId).pipe(
            take(1),
            finalize(() => this.loading = false)
        ).subscribe({
            next: (res: any) => {
                // 補專案標題/封面
                this.project = {
                    id: res.id ?? res.donateProjectId ?? res.projectId ?? projectId,
                    title: res.projectTitle ?? res.title ?? this.project?.title ?? '',
                    mainImageUrl: this.fund.fixPath
                        ? this.fund.fixPath(res.mainImagePath)
                        : (res.mainImagePath ?? this.project?.mainImageUrl ?? null),
                };

                // 方案搜尋（鍵名全面）
                const bag = (res.plans ?? res.donatePlans ?? []) as any[];
                const found = bag.find(p =>
                    Number(p?.donatePlan_id ?? p?.donatePlanId ?? p?.planId ?? p?.id) === planId
                );

                if (found) {
                    this.plan = {
                        id: planId,
                        title: found.title ?? found.planTitle ?? this.plan?.title ?? '',
                        price: +(found.price ?? this.plan?.price ?? 0),
                        description: found.description ?? found.planDescription ?? this.plan?.description ?? '',
                        imageUrl: this.fund.fixPath
                            ? this.fund.fixPath(found.imageUrl ?? found.planImagePath)
                            : (found.imageUrl ?? found.planImagePath ?? this.plan?.imageUrl ?? null),
                    };
                    this.errorMsg = null; // 若原本有錯誤訊息就清掉
                } else if (!this.plan) {
                    // 沒找到且沒有快照 → 顯示錯誤，但不導回
                    this.errorMsg = `找不到方案 #${planId}。`;
                }
            },
            error: (err) => {
                console.error('[plan-done] load failed', err);
                if (!this.project && !this.plan) this.errorMsg = '讀取專案資料失敗。';
            }
        });
    }

    get total() { return (this.plan?.price ?? 0) * (this.qty ?? 1); }

    onProjectImgError(ev: Event) { (ev.target as HTMLImageElement).src = 'assets/images/default.png'; }
    onPlanImgError(ev: Event) { (ev.target as HTMLImageElement).src = 'assets/images/default.png'; }

    backToAll() { this.router.navigate(['/fund', 'fund-project']); }
}
