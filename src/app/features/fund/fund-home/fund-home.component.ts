import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FundService, FundProject, FundCategory } from '../fund.service';

@Component({
    selector: 'app-fund-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './fund-home.component.html',
    styleUrls: ['./fund-home.component.css']
})
export class FundHomeComponent implements OnInit {

    categories: FundCategory[] = [];
    private _all = signal<FundProject[]>([]);
    private _hero = signal<FundProject | null>(null);

    constructor(private fund: FundService) { }

    ngOnInit(): void {
        this.fund.getCategories().subscribe((cs: FundCategory[]) => (this.categories = cs));

        // 先拿全部，再從「前5名(贊助人數)」挑隨機1筆當 hero
        this.fund.getProjects().subscribe((list: FundProject[]) => {
            this._all.set(list);

            this.fund.getTopByBackers(5).subscribe((top5: FundProject[]) => {
                if (top5.length) {
                    const pick = top5[Math.floor(Math.random() * top5.length)];
                    this._hero.set(pick);
                } else {
                    this._hero.set(list.length ? list[0] : null);
                }
            });
        });
    }

    // 提供給 template 使用的方法
    hero() { return this._hero(); }
    allProjects() { return this._all(); }

    percent(p: FundProject | null): number {
        if (!p) return 0;
        const val = (p.currentAmount / Math.max(1, p.targetAmount)) * 100;
        return Math.min(100, Math.round(val));
        // 若你不想用 signal，也可用一般屬性 + getter，template 寫法不變
    }

    daysLeft(p: FundProject | null): number {
        if (!p) return 0;
        const end = new Date(p.endDate);
        const ms = end.getTime() - Date.now();
        return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    }
}
