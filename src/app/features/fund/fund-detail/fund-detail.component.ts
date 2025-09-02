import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, RouterModule, Router, NavigationEnd } from '@angular/router';
import { FundService } from '../fund.service';
import { FundProject, CreateOrderDto, CreateOrderRes } from '../models';
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
    project = this._project.asReadonly();

    constructor(private route: ActivatedRoute,
        private api: FundService,
        private fundSvc: FundService,
        public auth: AuthService, private router: Router) { this.projectId = +this.route.snapshot.paramMap.get('id')!; }

    load(id: number) {
        this.fundSvc.getProjectById(id).subscribe(p => this._project.set(p));
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(pm => {
            const idStr = pm.get('id') ?? pm.get('projectId') ?? pm.get('donateProjectId');
            const id = Number(idStr);
            if (!Number.isFinite(id)) { this._project.set(null); return; }

            this.api.getProject(id).subscribe({
                next: (p) => {
                    // 1) 先把後端欄位正規化為前端模板用的名稱
                    const normalized = this.normalizeProject ? this.normalizeProject(p as any) : (p as any);

                    // 2) 路徑等後處理：用「合併」避免覆蓋掉 normalized 的欄位（包含 projectLongDescription）
                    const paths = this.normalizePaths ? this.normalizePaths(normalized) : {};
                    const finalData = { ...normalized, ...paths };

                    // 3) 設定到畫面狀態
                    this._project.set(finalData as any);
                },
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

    sponsor(): void {
        const p = this.project?.();                // 你目前是 signal()
        if (!p) return;

        // 以「專案 id」導到方案頁（假設路由是 /fund/fund-plan/:projectId）
        const projectId =
            p.id; // 依你的模型實際欄位擇一
        this.router.navigate(['/fund', 'fund-plan', projectId]);
    }

    private normalizeProject(res: any) {
        const id = res?.donateProjectId ?? res?.projectId ?? res?.id ?? null;
        return {
            id,
            donateProjectId: id,

            projectTitle: res?.projectTitle ?? res?.title ?? '',
            projectDescription: res?.projectDescription ?? res?.description ?? '',
            projectLongDescription: res?.projectLongDescription ?? res?.longDescription ?? '',

            targetAmount: Number(res?.targetAmount ?? 0),
            currentAmount: Number(res?.currentAmount ?? 0),
            backerCount: Number(res?.backerCount ?? 0),
            startDate: res?.startDate ?? null,
            endDate: res?.endDate ?? null,
            status: res?.status ?? '',

            mainImagePath: res?.mainImagePath ?? res?.mainImageUrl ?? null,

            // 方案也一併對齊，之後你的列表會用到
            plans: (res?.plans ?? res?.donatePlans ?? []).map((p: any) => ({
                id: p?.donatePlanId ?? p?.id ?? null,
                projectId: id,
                title: p?.planTitle ?? p?.title ?? '',
                price: Number(p?.price ?? 0),
                description: p?.planDescription ?? p?.description ?? null,
                imagePath: p?.imagePath ?? p?.planImagePath ?? null,
            })),
        };
    }
}
