import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

type FundStatus = '募資中' | '已下架';

interface FundProject {
    id: number;
    projectTitle: string;
    projectDescription?: string;
    longDescription?: string;
    currentAmount: number;
    targetAmount: number;
    startDate: string;  // ISO 字串即可
    endDate: string;
    backerCount: number;
    status: FundStatus;
    isFavorite?: boolean;

    // 圖片
    mainImagePath?: string;          // 主圖
    gallery?: string[];              // 內容圖(多張)
}

@Component({
    selector: 'app-fund-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './fund-detail.component.html',
    styleUrls: ['./fund-detail.component.css']
})
export class FundDetailComponent implements OnInit {
    mockProjects = [
        {
            id: 1,
            projectTitle: '療癒系動物插畫桌曆',
            projectDescription: '用療癒動物插畫陪你走過每一天的溫柔桌曆。',
            longDescription:
                `這是一款以療癒系小動物為主題的插畫桌曆，結合手繪風格與溫暖配色，陪伴你一整年。`,
            currentAmount: 25150,
            targetAmount: 30000,
            startDate: '2025-07-19',
            endDate: '2025-09-16',
            backerCount: 32,
            status: '募資中',
            isFavorite: false,
            // ✅ 主圖（請把檔案放到 src/assets/images/ 下面）
            mainImagePath: 'assets/images/animal.png',
            // ✅ 圖庫（可選）
            gallery: ['assets/images/bag.png', 'assets/images/animal.png']
        },
        {
            id: 2,
            projectTitle: '永續材質時尚背包',
            projectDescription: '結合環保與設計感的永續時尚書包計畫。',
            longDescription:
                '',
            currentAmount: 15150,
            targetAmount: 20000,
            endDate: '2025-10-01',
            startDate: '2025-07-25',
            backerCount: 28,
            status: '募資中',
            isFavorite: false,
            mainImagePath: 'assets/images/bag.png',
            gallery: ['assets/images/animal.png', 'assets/images/money.png']
        },
        {
            id: 3,
            projectTitle: '手作設計師限定作品',
            projectDescription: '精選設計師手作創作，展現獨特工藝與美感。',
            longDescription:
                '',
            currentAmount: 8000,
            targetAmount: 51000,
            endDate: '2025-12-01',
            startDate: '2025-07-25',
            backerCount: 50,
            status: '募資中',
            isFavorite: false,
            mainImagePath: 'assets/images/design.png',
            gallery: ['assets/images/animal.png', 'assets/images/money.png']
        },
        {
            id: 4,
            projectTitle: '財富自由的起點',
            projectDescription: '打造被動收入，適向財務自由人生。',
            longDescription:
                '',
            currentAmount: 15000,
            targetAmount: 32000,
            endDate: '2026-01-01',
            startDate: '2025-07-25',
            backerCount: 37,
            status: '募資中',
            isFavorite: false,
            mainImagePath: 'assets/images/money.png',
            gallery: ['assets/images/bag.png', 'assets/images/animal.png']
        }
    ];

    project = signal<any>(null);

    constructor(private route: ActivatedRoute) { }

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        const id = idParam ? Number(idParam) : this.mockProjects[0].id;
        const found = this.mockProjects.find(p => p.id === id) ?? this.mockProjects[0];
        this.project.set(found);
    }

    percent(): number {
        const p = this.project();
        if (!p) return 0;
        return Math.min(100, Math.round((p.currentAmount / p.targetAmount) * 100));
    }

    daysLeft(): number {
        const p = this.project();
        if (!p) return 0;
        const end = new Date(p.endDate).getTime();
        const now = Date.now();
        return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    }

    toggleFavorite(): void {
        const p = this.project();
        if (p) {
            p.isFavorite = !p.isFavorite;
            this.project.set({ ...p });
        }
    }

    sponsor(): void {
        alert(`贊助「${this.project()?.projectTitle}」專案`);
    }
}
