import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// 依你的實際路徑調整 import；只需要 FundPlan 與 ImageDto 型別
import { FundPlan, ImageDto, CreateOrderDto, CreateOrderRes, PlanDto } from '../models';
import { FundService } from '../fund.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { CartService } from 'app/shared/services/cart.service';
import { ProductProvider } from 'app/shared/types/product-provider';


@Component({
    selector: 'app-fund-plan',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './fund-plan.component.html',
    styleUrls: ['./fund-plan.component.css'],
})
export class FundPlanComponent implements OnInit {
    projectId!: number;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fundSvc: FundService,
    ) { }
    private readonly auth = inject(AuthService);
    private cartSvc = inject(CartService);

    /** 方案清單（對應 HTML 的 plans() 呼叫） */
    plans = signal<FundPlan[]>([]);
    /** 一次性圖片覆寫表：避免 (error) 無限循環 */
    imgSrcMap: Record<number | string, string> = {};

    /** 使用 data URI 作為預設圖，避免本地沒有 assets/default.png 時 404 */
    readonly fallbackImg =
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="100%25" height="100%25" fill="%23f2f2f2"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="20">No Image</text></svg>';

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        const projectId = idParam ? Number(idParam) : undefined;
        if (projectId) this.loadPlans(projectId);
    }

    /** 依序嘗試常見的 Service 方法名稱，避免打錯端點造成 404 */
    private loadPlans(projectId: number) {
        const svc: any = this.fundSvc;

        // 候選方法名稱（依你專案可能的命名）
        const candidates = [
            'getPlansByProject',       // (projectId)
            'getPlansByProjectId',     // (projectId)
            'getProjectPlans',         // (projectId)
            'getPlans',                // (projectId) — 若此方法用於其他用意，稍後會檢查回傳型別
        ];

        const fnName = candidates.find(n => typeof svc[n] === 'function');
        if (!fnName) {
            console.warn('[fund-plan] 找不到可用的 FundService 取方案方法，請確認 service。');
            return;
        }

        try {
            const obs$ = svc[fnName](projectId);
            if (!obs$ || typeof obs$.subscribe !== 'function') {
                console.warn(`[fund-plan] ${fnName} 並未回傳 Observable。`);
                return;
            }

            obs$.subscribe({
                next: (res: any) => {
                    const list = this.normalizePlans(res);
                    this.plans.set(list);
                },
                error: (err: any) => {
                    console.error(`[fund-plan] 載入方案失敗 (${fnName})`, err);
                    this.plans.set([]); // 失敗時顯示空狀態（你的 HTML 會顯示「目前尚無方案。」）
                },
            });
        } catch (e) {
            console.error('[fund-plan] 呼叫取方案方法拋出例外：', e);
            this.plans.set([]);
        }
    }

    private get backendOrigin(): string {
        try {
            const { protocol, hostname } = window.location;
            return `${protocol}//${hostname}:7104`;
        } catch {
            return 'http://localhost:7104';
        }
    }

    // 只對「路徑片段」做編碼（協定/主機不編碼）
    private encodePathSegments(pathname: string): string {
        return pathname
            .split('/')
            .map(seg => (seg ? encodeURIComponent(seg) : seg)) // 保留空段，避免 '//' 被吃掉
            .join('/');
    }

    /** 將相對/半相對路徑轉完整 URL；若已是絕對 URL 則原樣（僅規範化 path 的編碼） */
    private toPlanImageUrl(rel?: string): string {
        if (!rel) return this.fallbackImg;

        // 正規化分隔符
        const raw = rel.trim().replace(/\\/g, '/');
        if (!raw) return this.fallbackImg;

        // 1) 已是絕對 URL（或協定相對 //host/...）
        if (/^(https?:)?\/\//i.test(raw)) {
            try {
                const abs = raw.startsWith('//') ? `${window.location.protocol}${raw}` : raw;
                const u = new URL(abs);
                // 先 decode 再逐段 encode，避免重複/錯誤編碼
                u.pathname = this.encodePathSegments(decodeURIComponent(u.pathname));
                return u.toString();
            } catch {
                return raw; // 解析失敗就原樣使用
            }
        }

        // 2) 以網站根目錄開頭 → 直接接主機
        if (raw.startsWith('/')) {
            return `${this.backendOrigin}${this.encodePathSegments(raw)}`;
        }

        // 3) 內含 FundImages（大小寫不敏感）→ 視為半相對，補一個開頭斜線再接主機
        if (/fundimages\//i.test(raw)) {
            const withSlash = '/' + raw.replace(/^\/+/, '');
            return `${this.backendOrigin}${this.encodePathSegments(withSlash)}`;
        }

        // 4) 僅有檔名 → 接到 Plans 資料夾（依你的實際儲存目錄調整）
        return `${this.backendOrigin}/FundImages/Plans/${encodeURIComponent(raw)}`;
    }

    /** 正規化各種回傳結構 → FundPlan[] */
    private normalizePlans(raw: any): FundPlan[] {
        let arr: any[] = [];

        if (Array.isArray(raw)) {
            arr = raw;
        } else if (raw?.data && Array.isArray(raw.data)) {
            arr = raw.data;
        } else if (raw?.items && Array.isArray(raw.items)) {
            arr = raw.items;
        } else if (raw?.result && Array.isArray(raw.result)) {
            arr = raw.result;
        }

        // 盡量保留你原本的欄位；只補齊 id/title/price/description/imagePath 這些常用鍵
        return (arr as any[]).map(x => {
            const anyx = x as any;

            // 嘗試取圖片：plan 自有 → ImageDto[d.donatePlanId === plan.id] → 其它常見鍵
            const imgs: ImageDto[] | undefined = anyx.donateImages ?? anyx.images;
            const chosen =
                imgs?.find(
                    (d: any) =>
                        (d.donatePlanId ?? d.planId ?? d.donatePlans_id) === (anyx.id ?? anyx.donatePlanId)
                ) ?? imgs?.[0];

            const path =
                (anyx.imagePath ?? anyx.planImagePath) ??
                chosen?.donateImagePath ??
                (chosen as any)?.imagePath ??
                (chosen as any)?.path ??
                null;

            const mapped: FundPlan = {
                id: anyx.id ?? anyx.donatePlanId,
                projectId: anyx.projectId ?? anyx.donateProjectId,
                title: anyx.title ?? anyx.planTitle ?? anyx.name ?? '未命名方案',
                price: Number(anyx.price ?? anyx.amount ?? 0),
                description: anyx.description ?? anyx.planDescription ?? null,
                imagePath: this.toFullUrl(path ?? undefined),
                // 盡量把原始 donateImages 帶著，供前端備援
                ...(imgs ? { donateImages: imgs } : {}),
            } as any;

            return mapped;
        });
    }

    /** 把相對路徑補成完整 URL：優先用 FundService.img()，退回 imageUrl() */
    private toFullUrl(rel?: string): string {
        const svc: any = this.fundSvc;
        try {
            if (rel) {
                if (typeof svc.img === 'function') return svc.img(rel);
                if (typeof svc.imageUrl === 'function') return svc.imageUrl(rel);
                return rel;
            } else {
                // 讓預設圖也能走 service 的預設處理（若有）
                if (typeof svc.imageUrl === 'function') return svc.imageUrl(null);
                return this.fallbackImg;
            }
        } catch {
            return this.fallbackImg;
        }
    }

    /** 取得方案圖片：優先用 donateImages（donatePlanId === plan.id），其次看 plan 自身欄位 */
    getPlanImage(plan: FundPlan): string {
        const override = this.imgSrcMap[(plan as any).id];
        if (override) return override;

        const anyPlan = plan as any;

        // A. 從 donateImages 依 donatePlanId 篩第一張
        const imgs = (anyPlan.donateImages ?? anyPlan.images) as ImageDto[] | undefined;
        const picked =
            imgs?.find((d: any) => (d.donatePlanId ?? d.planId ?? d.donatePlans_id) === anyPlan.id)
            ?? imgs?.[0];

        const fromImages =
            (picked as any)?.donateImagePath ?? (picked as any)?.imagePath ?? (picked as any)?.path;

        if (fromImages) return this.toPlanImageUrl(fromImages);

        // B. 次要：plan 自身欄位
        const direct = anyPlan.planImagePath ?? anyPlan.imagePath;
        if (direct) return this.toPlanImageUrl(direct);

        // C. 最後：fallback（不會 404）
        return this.fallbackImg;
    }

    /** 圖片載入失敗：一次性覆寫，避免無限 error */
    onImgErr(ev: Event, plan: FundPlan) {
        const img = ev.target as HTMLImageElement;
        img.onerror = null; // 關閉後續 error
        this.imgSrcMap[(plan as any).id] = this.fallbackImg; // 覆寫來源
        img.src = this.fallbackImg; // 立即替換
    }

    choose(p: { id: number; title: string; price: number }) {
        // 未登入：提示並導到登入頁，不打 API
        if (!this.auth.isLoggedIn()) {
            alert('請先登入會員');
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }

        // UpsertCartItemRequest：id 必須是 string；provider 固定 'Fund'
        const body = {
            productProvider: 'Fund' as const,
            id: String(p.id), // ★ 很重要：轉字串（若你們要複合鍵就改成 `${this.projectId}:${p.id}`）
            quantity: 1,
        };

        // 送出（CartService 應以 withCredentials:true 呼叫後端）
        this.cartSvc.upsertItem(body).subscribe({
            next: () => this.router.navigateByUrl('/cart'),
            error: (err) => {
                if (err?.status === 401) {
                    alert('請先登入會員');
                    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
                    return;
                }
                if (err?.status === 400) {
                    console.error('[upsertItem 400] body=', body, 'err=', err);
                    alert('加入購物車失敗：參數格式不正確（400）');
                    return;
                }
                console.error('[upsertItem] error=', err);
                alert('加入購物車失敗，請稍後再試');
            }
        });
    }
}
