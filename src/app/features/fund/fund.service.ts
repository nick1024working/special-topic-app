import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FundProject {
    id: number;
    projectTitle: string;
    projectDescription: string;
    longDescription?: string;
    currentAmount: number;
    targetAmount: number;
    startDate: string; // ISO yyyy-MM-dd
    endDate: string;   // ISO yyyy-MM-dd
    backerCount: number;
    status: '募資中' | '已下架' | '已結束';
    mainImagePath?: string;
    gallery?: string[];
    isFavorite?: boolean;
    /** 分類 slug（對應 Category.slug） */
    category?: string;
    categorySlug?: string;
}

export interface FundCategory {
    slug: string;
    name: string;
}

@Injectable({ providedIn: 'root' })
export class FundService {

    private _categories: FundCategory[] = [
        { slug: 'business', name: '商業理財' },
        { slug: 'society', name: '人文社會' },
        { slug: 'comics', name: '圖文漫畫' },
        { slug: 'healthcare', name: '醫療保健' },
        { slug: 'idol', name: '影視偶像' },
        { slug: 'style', name: '生活風格' },
    ];

    private _projects: FundProject[] = [
        {
            id: 1,
            projectTitle: '療癒系動物插畫桌曆',
            projectDescription: '用療癒動物插畫陪你走過每一天的溫柔桌曆。',
            longDescription:
                '這是一款以療癒系小動物為主題的插畫桌曆，結合手繪與溫暖配色，陪伴你一年到頭。\n\n' +
                '內含十二張月曆、四張貼紙與小卡，紙張使用 FSC 認證紙，印製採用環保油墨。',
            currentAmount: 25150,
            targetAmount: 30000,
            startDate: '2025-07-19',
            endDate: '2025-09-16',
            backerCount: 32,
            status: '募資中',
            isFavorite: false,
            mainImagePath: 'assets/images/animal.png',
            gallery: ['assets/images/animal2.png', 'assets/images/animal.png'],
            category: 'comics'
        },
        {
            id: 2,
            projectTitle: '永續材質時尚背包',
            projectDescription: '結合環保與設計感的永續時尚書包計畫。',
            longDescription:
                '以寶特瓶回收纖維搭配耐磨帆布，實用與質感兼具。\n\n' +
                '容量 24L、筆電夾層、防潑水處理，通勤旅遊都適合。',
            currentAmount: 15150,
            targetAmount: 20000,
            endDate: '2025-10-01',
            startDate: '2025-07-25',
            backerCount: 28,
            status: '募資中',
            isFavorite: false,
            mainImagePath: 'assets/images/bag.png',
            gallery: ['assets/images/animal.png', 'assets/images/money.png'],
            category: 'style'
        },
        {
            id: 3,
            projectTitle: '手作設計師限定作品',
            projectDescription: '精選設計師手作創作，展現獨特工藝與美感。',
            longDescription:
                '每件作品皆由設計師獨立手作，數量有限；\n材質以黃銅、皮革與天然木料為主。',
            currentAmount: 8000,
            targetAmount: 51000,
            endDate: '2025-12-01',
            startDate: '2025-07-25',
            backerCount: 50,
            status: '募資中',
            isFavorite: false,
            mainImagePath: 'assets/images/design.png',
            gallery: ['assets/images/animal.png', 'assets/images/money.png'],
            category: 'style'
        },
        {
            id: 4,
            projectTitle: '財富自由的起點',
            projectDescription: '打造被動收入，適向財務自由人生。',
            longDescription:
                '以理財課程的方式，提供完整的現金流規劃工具與操作方法。',
            currentAmount: 15000,
            targetAmount: 32000,
            endDate: '2026-01-01',
            startDate: '2025-07-25',
            backerCount: 37,
            status: '募資中',
            isFavorite: false,
            mainImagePath: 'assets/images/money.png',
            gallery: ['assets/images/bag.png', 'assets/images/animal.png'],
            category: 'business'
        }
    ];

    /** 取得所有分類 */
    getCategories(): Observable<FundCategory[]> {
        return of(this._categories);
    }

    /** 取得專案（可選擇分類與關鍵字） */
    getProjects(category?: string | null, q?: string | null): Observable<FundProject[]> {
        return of(this._projects).pipe(
            map(list => {
                let result = list;

                if (category) {
                    result = result.filter(p => (p.category || p.categorySlug) === category);
                }

                if (q && q.trim()) {
                    const k = q.trim().toLowerCase();
                    result = result.filter(p =>
                        p.projectTitle.toLowerCase().includes(k) ||
                        p.projectDescription.toLowerCase().includes(k)
                    );
                }

                return result;
            })
        );
    }

    /** 取出前 n 名(依 backerCount) */
    getTopByBackers(n = 5): Observable<FundProject[]> {
        const copy = [...this._projects].sort((a, b) => b.backerCount - a.backerCount).slice(0, n);
        return of(copy);
    }

    /** 依 id 取得單一專案 */
    getById(id: number): Observable<FundProject | undefined> {
        return of(this._projects.find(p => p.id === id));
    }
}
