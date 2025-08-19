import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FundService } from '../fund.service';
import { FundPlan } from '../models';

@Component({
    selector: 'app-fund-plan',
    standalone: true,
    imports: [CommonModule, NgIf, NgFor, RouterModule],
    templateUrl: './fund-plan.component.html'
})
export class FundPlanComponent implements OnInit {

    private _plans = signal<FundPlan[]>([]);
    plans() { return this._plans(); }

    projectId = 0;

    constructor(private route: ActivatedRoute, private api: FundService, private router: Router) { }

    ngOnInit(): void {
        const pm = this.route.snapshot.paramMap;
        const idStr = pm.get('id') ?? pm.get('projectId') ?? pm.get('donateProjectId');
        const id = Number(idStr);

        if (!Number.isFinite(id)) {
            console.warn('[fund-plan] 無法解析 id，paramMap =', pm);
            this._plans.set([]);           // 不要 navigate 回首頁，以免看起來「被彈回去」
            return;
        }

        this.projectId = id;
        this.api.getPlans(id).subscribe({
            next: list => this._plans.set(list ?? []),
            error: err => { console.error('[fund-plan] getPlans 失敗', err); this._plans.set([]); }
        });
    }

    image(p: FundPlan) {
        return p.imagePath || '/assets/images/default.png';
    }

    choose(p: FundPlan) {
        console.log('choose plan', p);
        // TODO: 導到結帳／填寫頁，例如：
        // this.router.navigate(['/', 'fund', 'checkout', this.projectId, p.id]);
    }
}
