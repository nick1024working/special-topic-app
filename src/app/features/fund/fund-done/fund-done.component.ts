import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FundService } from '../fund.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { environment } from 'environments/environment';
import { CommonModule } from '@angular/common';

type ProjectVM = {
    id: number;
    title: string;
    description: string;
    longDescription: string;
    targetAmount: number;
    mainImageFile?: string | null;
    mainImageUrl?: string | null;
    createdAt?: string | Date | null;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
};

type PlanVM = {
    id?: number;
    title: string;
    description: string;
    price: number;
    imageFile?: string | null;
    imageUrl?: string | null;
    createdAt?: string | Date | null;
};

@Component({
    selector: 'app-fund-done',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './fund-done.component.html'
})
export class FundDoneComponent implements OnInit, OnDestroy {
    project: ProjectVM | null = null;
    plans: PlanVM[] = [];
    loading = true;
    private destroy$ = new Subject<void>();
    private projectImgCandidates: string[] = [];
    private projectImgIdx = 0;
    private planImgCandidates: string[][] = []; // plans 對應的候選清單
    private planImgIdx: number[] = [];         // plans 對應的目前索引

    /** 多組候選靜態路徑，會依序嘗試（避免不同專案的靜態路徑不一致） */
    private imageBases = [
        '', // 已是絕對網址就不加 base
        '/uploads',
        '/FundImages',
        '/images',
        '/static'
    ];

    private buildCandidatesForProject(projectId: number, file?: string | null): string[] {
        if (!file) return [];
        const api = (environment.apiBaseUrl || '').replace(/\/+$/, '');
        // 注意：不要重複 /FundImages
        return [
            `${api}/FundImages/Projects/${projectId}/${file}`,
            `${api}/uploads/FundImages/Projects/${projectId}/${file}`
        ];
    }

    private buildCandidatesForPlan(file?: string | null): string[] {
        if (!file) return [];
        const api = (environment.apiBaseUrl || '').replace(/\/+$/, '');
        return [
            `${api}/FundImages/Plans/${file}`,
            `${api}/uploads/FundImages/Plans/${file}`
        ];
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fundSvc: FundService
    ) { }

    ngOnInit(): void {
        this.route.paramMap
            .pipe(
                switchMap(pm => this.fundSvc.getProjectById(Number(pm.get('id') || 0))),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (p: any) => {
                    this.project = this.normalizeProject(p);

                    // 建立候選清單並設定第一張
                    this.projectImgCandidates = this.buildCandidatesForProject(this.project.id, this.project.mainImageFile);
                    this.projectImgIdx = 0;
                    this.project.mainImageUrl = this.projectImgCandidates[0] ?? null;

                    this.fundSvc.getPlansByProject(this.project.id)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                            next: (list: any[]) => {
                                this.plans = (list || []).map(pl => this.normalizePlan(pl));

                                // 每個方案建立候選清單
                                this.planImgCandidates = this.plans.map(pl => this.buildCandidatesForPlan(pl.imageFile));
                                this.planImgIdx = this.planImgCandidates.map(() => 0);
                                this.plans.forEach((pl, i) => pl.imageUrl = this.planImgCandidates[i][0] ?? null);

                                this.loading = false;
                            },
                            error: () => { this.loading = false; }
                        });
                },
                error: () => { this.loading = false; }
            });
    }

    /** 建立時間：把常見命名都吃進來 */
    private pickCreatedAt(o: any): string | Date | null {
        return (
            o?.createdAt ??
            o?.created_at ??
            o?.createTime ??
            o?.createdTime ??
            o?.createdDate ??
            o?.createDate ??
            o?.created_on ??
            o?.created ??
            null
        );
    }

    /** 募資期間：常見命名 */
    private pickStart(o: any): string | Date | null {
        return o?.startDate ?? o?.start_time ?? o?.start ?? null;
    }
    private pickEnd(o: any): string | Date | null {
        return o?.endDate ?? o?.end_time ?? o?.end ?? null;
    }

    private normalizeProject(p: any): ProjectVM {
        return {
            id: p?.id ?? p?.donateProjectId ?? 0,
            title: p?.projectTitle ?? p?.title ?? '',
            description: p?.projectDescription ?? p?.description ?? '',
            longDescription: p?.projectLongDescription ?? p?.longDescription ?? '',
            targetAmount: Number(p?.targetAmount ?? p?.target_amount ?? 0),
            // 後端通常只回「檔名」，先存下檔名，待會再組完整 URL
            mainImageFile: p?.mainImagePath ?? p?.projectMainImagePath ?? p?.coverFileName ?? null,
            createdAt: this.pickCreatedAt(p),
            startDate: this.pickStart(p),
            endDate: this.pickEnd(p)
        };
    }

    private normalizePlan(pl: any): PlanVM {
        return {
            id: pl?.id ?? pl?.planId ?? undefined,
            title: pl?.title ?? pl?.planTitle ?? '',
            description: pl?.description ?? pl?.planDescription ?? '',
            price: Number(pl?.price ?? 0),
            imageFile: pl?.imagePath ?? pl?.planImagePath ?? pl?.fileName ?? null,
            createdAt: this.pickCreatedAt(pl)
        };
    }

    /** 依序產生候選 URL，遇到絕對網址或 / 開頭則直接使用原值 */
    private firstImageUrlCandidate(file?: string | null, builder?: (base: string) => string): string | null {
        if (!file) return null;
        if (/^(https?:)?\/\//i.test(file) || file.startsWith('/')) {
            return file; // 本身就是完整網址
        }
        const api = (environment.apiBaseUrl || '').replace(/\/+$/, '');
        for (const base of this.imageBases) {
            const path = builder ? builder(base) : `${base}/${file}`;
            // 組成完整網址
            const url = `${api}${path.startsWith('/') ? '' : '/'}${path}`;
            // 直接回第一個候選（若仍 404，HTML 會觸發 onerror，我們再換下一個）
            return url;
        }
        return null;
    }

    /** <img (error)> 時呼叫：依序嘗試下一個候選 */
    onProjectImgError(ev: Event) {
        const img = ev.target as HTMLImageElement | null;
        if (!img) return;

        this.projectImgIdx++;
        const next = this.projectImgCandidates[this.projectImgIdx];
        if (next) img.src = next;
    }

    onPlanImgError(i: number, ev: Event) {
        const img = ev.target as HTMLImageElement | null;
        if (!img) return;

        this.planImgIdx[i] = (this.planImgIdx[i] ?? 0) + 1;
        const next = this.planImgCandidates[i]?.[this.planImgIdx[i]];
        if (next) img.src = next;
    }

    backToAll(): void { this.router.navigate(['/', 'fund', 'fund-project']); }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
