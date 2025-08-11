import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FundService, FundProject, FundCategory } from '../fund.service';

@Component({
    selector: 'app-fund-project',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './fund-project.component.html',
    styleUrls: ['./fund-project.component.css']
})
export class FundProjectComponent implements OnInit {

    categories: FundCategory[] = [];
    projects: FundProject[] = [];

    selectedCategory: string | null = null;
    searchText = '';

    constructor(private fund: FundService, private router: Router) { }

    ngOnInit(): void {
        this.loadCategories();
        this.loadProjects();
    }

    loadCategories(): void {
        this.fund.getCategories().subscribe((cs: FundCategory[]) => {
            this.categories = cs;
        });
    }

    loadProjects(): void {
        this.fund
            .getProjects(this.selectedCategory, this.searchText)
            .subscribe((list: FundProject[]) => {
                this.projects = list;
            });
    }

    onCategoryChange(slug: string): void {
        this.selectedCategory = slug;
        this.loadProjects();
    }

    clearCategory(): void {
        this.selectedCategory = null;
        this.loadProjects();
    }

    onSearch(): void {
        this.loadProjects();
    }

    goToDetail(id: number): void {
        this.router.navigate(['fund/fund-detail', id]);   // ← 與路由一致
    }

    getProgressPercent(p: FundProject): number {
        const percent = (p.currentAmount / Math.max(1, p.targetAmount)) * 100;
        return Math.min(100, Math.round(percent));
    }

    getDaysLeft(endDate: string | Date): number {
        const end = new Date(endDate);
        const ms = end.getTime() - Date.now();
        return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    }
}
