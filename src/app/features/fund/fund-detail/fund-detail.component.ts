import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FundService } from '../fund.service';
import { FundProject } from '../models';

@Component({
    selector: 'app-fund-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, NgIf, NgFor],
    templateUrl: './fund-detail.component.html',
    styleUrls: ['./fund-detail.component.css']
})
export class FundDetailComponent implements OnInit {

    // 詳細資料（配合你的 HTML 用 project() 取得）
    private _project = signal<FundProject | null>(null);
    project() { return this._project(); }

    constructor(private route: ActivatedRoute, private api: FundService, private router: Router,) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(pm => {
            const idStr = pm.get('id') ?? pm.get('projectId') ?? pm.get('donateProjectId');
            const id = Number(idStr);
            if (!Number.isFinite(id)) { this._project.set(null); return; }
            this.api.getProject(id).subscribe({
                next: p => this._project.set(this.normalizePaths(p)),
                error: _ => this._project.set(null)
            });
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
    sponsor(): void {
        const id = this.project()?.id;
        if (!id) return;
        this.router.navigate(['/', 'fund', 'fund-plan', id]);  // /fund/fund-plan/:id
    }
}
