import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FundService } from '../fund.service';
import { FundProject, FundCategory } from '../models';

@Component({
    selector: 'app-fund-home',
    standalone: true,
    imports: [CommonModule, RouterModule, NgIf, NgFor, RouterLink, FormsModule],
    templateUrl: './fund-home.component.html',
    styleUrls: ['./fund-home.component.css']
})
export class FundHomeComponent implements OnInit {

    /** 類別列（for 探索專案類別） */
    categories: FundCategory[] = [];

    /** Hero：前5名募資人數中隨機1筆 */
    private _hero = signal<FundProject | null>(null);

    /** 全部專案清單 */
    private _all = signal<FundProject[]>([]);

    constructor(private fund: FundService) { }

    ngOnInit(): void {
        // 取分類
        this.fund.getCategories().subscribe(cats => this.categories = cats);

        // 取前5名 → 隨機抽1筆當 Hero
        this.fund.getTopByBackers(5).subscribe(list => {
            this._hero.set(list?.length ? list[Math.floor(Math.random() * list.length)] : null);
        });

        // 取全部專案
        this.fund.getProjects().subscribe(list => this._all.set(list ?? []));
    }

    // 提供給 template 使用（保留你原本的呼叫方式）
    hero() { return this._hero(); }
    allProjects() { return this._all(); }

    /** 專案 id 抽取（相容多種欄位命名） */
    projectId = (p: any) => p?.id ?? p?.donateProjectId ?? p?.donateProject_id ?? p?.projectId;

    /** 進度條百分比（0~100） */
    percent(p: FundProject | null): number {
        if (!p) return 0;
        const val = (p.currentAmount / Math.max(1, p.targetAmount)) * 100;
        return Math.min(100, Math.round(val));
    }

    /** 剩餘天數（以 endDate - 今天） */
    daysLeft(p: FundProject | null): number {
        if (!p) return 0;
        const end = new Date(p.endDate);
        const ms = end.getTime() - Date.now();
        return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    }

    readonly featuredProjects = computed<FundProject[]>(() => {
        const src = this.allProjects ? this.allProjects() : [];
        return [...src]
            .sort((a, b) => (b.backerCount ?? 0) - (a.backerCount ?? 0))
            .slice(0, 8);
    });
}
