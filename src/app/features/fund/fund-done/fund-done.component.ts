import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { environment } from 'environments/environment';
import { FundService } from '../fund.service';

/* ========= ViewModels ========= */
interface ProjectVM {
    id: number;
    title: string;
    description: string | null;
    longDescription: string | null;
    targetAmount: number;
    createdAt: string | Date | null;
    startDate: string | Date | null;
    endDate: string | Date | null;
    // 由後端傳回（可能為 null）
    mainImagePath: string | null;
    // 給 <img src> 用（絕對網址）
    mainImageUrl: string | null;
}

interface PlanVM {
    id: number;
    title: string;
    description: string | null;
    price: number;
    createdAt: string | Date | null;
    imagePath: string | null;  // 相對路徑
    imageUrl: string | null;   // 絕對網址
}

/* ========= Component ========= */
@Component({
    standalone: true,
    selector: 'app-fund-done',
    templateUrl: './fund-done.component.html',
    styleUrls: ['./fund-done.component.scss'],
    imports: [CommonModule, DatePipe],
})
export class FundDoneComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private fundSvc = inject(FundService);

    loading = true;
    project: ProjectVM | null = null;
    plans: PlanVM[] = [];

    // 圖片候選清單 / 索引
    private projectImgCandidates: string[] = [];
    private projectImgIdx = 0;
    private planImgCandidates: string[][] = [];
    private planImgIdx: number[] = [];

    private sub?: Subscription;

    ngOnInit(): void {
        this.sub = this.route.paramMap
            .pipe(
                switchMap(pm => {
                    const id = Number(pm.get('id') ?? 0);
                    return this.fundSvc.getProjectById(id);
                })
            )
            .subscribe({
                next: (rawProject: any) => {
                    // 1) 專案資料正規化 + 取圖
                    this.project = this.normalizeProject(rawProject);
                    this.prepareProjectImage(this.project, rawProject);

                    // 2) 撈方案
                    if (this.project?.id != null) {
                        this.fundSvc.getPlansByProject(this.project.id).subscribe({
                            next: (rawPlans: any[]) => {
                                this.plans = (rawPlans ?? []).map(p => this.normalizePlan(p));
                                this.preparePlanImages(this.plans, rawPlans ?? []);
                                this.loading = false;
                            },
                            error: () => (this.loading = false),
                            complete: () => (this.loading = false),
                        });
                    } else {
                        this.loading = false;
                    }
                },
                error: () => (this.loading = false),
            });
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    /* ========= Template handlers ========= */

    /** 專案主圖載入失敗 → 換下一個候選 URL */
    onProjectImgError(ev: Event) {
        const img = ev.target as HTMLImageElement | null;
        if (!img) return;
        this.projectImgIdx++;
        const next = this.projectImgCandidates[this.projectImgIdx];
        if (next) {
            img.src = next;
        } else {
            // 候選都失敗 → 預設圖
            img.src = this.fundSvc.imageUrl(null as any);
        }
    }

    /** 方案圖載入失敗 → 換下一個候選 URL */
    onPlanImgError(i: number, ev: Event) {
        const img = ev.target as HTMLImageElement | null;
        if (!img) return;
        this.planImgIdx[i] = (this.planImgIdx[i] ?? 0) + 1;
        const next = this.planImgCandidates[i]?.[this.planImgIdx[i]];
        if (next) {
            img.src = next;
        } else {
            img.src = this.fundSvc.imageUrl(null as any);
        }
    }

    /** 回到所有專案 */
    backToAll() {
        this.router.navigate(['/fund', 'fund-project']);
    }

    /* ========= Normalize ========= */

    private normalizeProject(p: any): ProjectVM {
        return {
            id: coalesceNumber(p?.donateProjectId, p?.DonateProjectId, p?.id) ?? 0,
            title: coalesceStr(p?.projectTitle, p?.ProjectTitle, p?.title) ?? '',
            description: coalesceStr(p?.projectDescription, p?.ProjectDescription, p?.description),
            longDescription: coalesceStr(p?.longDescription, p?.LongDescription, p?.projectLongDescription),
            targetAmount: Number(coalesceNumber(p?.targetAmount, p?.TargetAmount, 0)),
            createdAt: forceUtcToDate(pickCreatedAt(p) ?? p?.startDate ?? p?.StartDate ?? null),
            startDate: p?.startDate ?? p?.StartDate ?? null,
            endDate: p?.endDate ?? p?.EndDate ?? null,
            mainImagePath: coalesceStr(p?.mainImagePath, p?.MainImagePath) ?? null,
            mainImageUrl: null,
        };
    }

    private normalizePlan(pl: any): PlanVM {
        return {
            id: coalesceNumber(pl?.id, pl?.planId, pl?.PlanId) ?? 0,
            title: coalesceStr(pl?.title, pl?.planTitle, pl?.PlanTitle) ?? '',
            description: coalesceStr(pl?.description, pl?.planDescription, pl?.PlanDescription),
            price: Number(coalesceNumber(pl?.price, pl?.Price, 0)),
            createdAt: pickCreatedAt(pl) ?? pl?.startDate ?? pl?.StartDate ?? null,
            imagePath:
                coalesceStr(pl?.imagePath, pl?.ImagePath, pl?.planImagePath, pl?.PlanImagePath) ??
                null,
            imageUrl: null,
        };
    }

    /* ========= Image helpers ========= */

    /** 準備專案主圖：從多個欄位回退，最後轉成絕對網址與候選清單 */
    private prepareProjectImage(vm: ProjectVM, raw: any) {
        // 若主圖沒給，嘗試從 Gallery[] 或 DonateImages[] 取第一張
        if (!vm.mainImagePath) {
            const gallery: string[] | undefined = raw?.gallery ?? raw?.Gallery ?? undefined;
            if (Array.isArray(gallery) && gallery.length > 0) {
                vm.mainImagePath = gallery[0] || null;
            }
        }
        if (!vm.mainImagePath) {
            const donateImages: any[] | undefined = raw?.donateImages ?? raw?.DonateImages ?? undefined;
            // 嘗試找 isMain / IsMain，其次取第一張
            const main = donateImages?.find(x => x?.isMain === true || x?.IsMain === true);
            vm.mainImagePath =
                main?.projectGalleryPath ??
                main?.ProjectGalleryPath ??
                main?.donateImagePath ??
                main?.DonateImagePath ??
                donateImages?.[0]?.projectGalleryPath ??
                donateImages?.[0]?.donateImagePath ??
                null;
        }

        // 產生候選列表（相對路徑 → 絕對網址）
        this.projectImgCandidates = candidatesFromRelativePath(vm.mainImagePath);
        this.projectImgIdx = 0;

        // 第一張先用候選；若沒有候選但有相對路徑，就用 service 的 imageUrl（處理 http/絕對路徑/預設圖）
        vm.mainImageUrl = this.projectImgCandidates[0]
            ?? (vm.mainImagePath ? this.fundSvc.imageUrl(vm.mainImagePath) : null);
    }


    /** 準備每個方案圖片：若沒給 imagePath 就維持空值；有的話建立候選清單 */
    private preparePlanImages(vms: PlanVM[], raws: any[]) {
        this.planImgCandidates = vms.map((vm, idx) => {
            if (!vm.imagePath) {
                // 某些後端會把圖放到 item.image / item.Image
                const raw = raws[idx];
                vm.imagePath = coalesceStr(raw?.image, raw?.Image, vm.imagePath) ?? null;
            }
            const list = candidatesFromRelativePath(vm.imagePath);
            // 第一張先用候選；若沒有候選但有相對路徑，就用 service 的 imageUrl
            vm.imageUrl = list[0] ?? (vm.imagePath ? this.fundSvc.imageUrl(vm.imagePath) : null);
            return list;
        });
        this.planImgIdx = this.planImgCandidates.map(() => 0);
    }

    goMyFund(): void {
        this.router.navigate(['/fund/my-fund']);
    }
}

/* ========= Utilities ========= */

function absUrl(relPath: string): string {
    const base = (environment as any)?.apiBaseUrl || window.location.origin;
    const clean = String(relPath ?? '').replace(/^\/+/, '');
    return new URL(clean, base.endsWith('/') ? base : base + '/').toString();
}

/** 由相對路徑產生候選：不含 uploads → 含 uploads */
function candidatesFromRelativePath(relPath?: string | null): string[] {
    if (!relPath) return [];
    const clean = String(relPath).replace(/^\/+/, '');
    return [absUrl('/' + clean), absUrl('/uploads/' + clean)];
}

function pickCreatedAt(o: any): string | Date | null {
    return (
        o?.createdAt ?? o?.CreatedAt ??
        o?.created_at ?? o?.createTime ?? o?.createdTime ??
        o?.createdDate ?? o?.createDate ?? o?.created_on ?? o?.created ??
        o?.insertedAt ?? o?.insertTime ?? null
    );
}
function coalesceStr<T extends string | null | undefined>(...xs: T[]): string | null {
    for (const x of xs) if (typeof x === 'string' && x.trim() !== '') return x;
    return null;
}
function coalesceNumber(...xs: any[]): number | null {
    for (const x of xs) {
        const n = Number(x);
        if (!Number.isNaN(n)) return n;
    }
    return null;
}

function forceUtcToDate(x: string | Date | null): Date | null {
    if (!x) return null;
    if (x instanceof Date) return x;
    const s = String(x).trim();

    // 只有日期：YYYY-MM-DD -> 補成 UTC 午夜
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00Z');

    // ISO 無時區：YYYY-MM-DDTHH:mm(:ss)(.fff) -> 視為 UTC（補 Z）
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(s) && !/[zZ]|[+\-]\d{2}:\d{2}$/.test(s)) {
        return new Date(s + 'Z');
    }

    // 其他情況交給原生 Date 解析（含 +00:00 / Z）
    return new Date(s);
}
