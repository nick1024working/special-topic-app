import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { HomePageComponent } from './shared/pages/home-page/home-page.component';
import { ErrorPageComponent } from './shared/pages/error-page/error-page.component';

/** 主路由 */
// 此處把各子服務路由分開管理，減少衝突。
// 此處使用純版型方式管理
// NOTE: wildcard 放在最後匹配。
export const routes: Routes = [
    // 公開版型
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: '', component: HomePageComponent  },

            // ========== 以下為各子服務 ==========
            // 可各自更改各自花括號內容，但名稱請勿搶名。
            {
                path: 'ebook',
                loadChildren: () =>
                    import('./features/ebook/ebook.routes').then((m) => m.EBOOK_ROUTES),
            },
            {
                path: 'forum',
                loadChildren: () =>
                    import('./features/forum/forum.routes').then((m) => m.FORUM_ROUTES),
            },
            {
                path: 'fund',
                loadChildren: () =>
                    import('./features/fund/fund.routes').then((m) => m.FUND_ROUTES),
            },
            {
                path: 'used-book',
                loadChildren: () =>
                    import('./features/used-book/used-book.routes').then((m) => m.USED_BOOK_ROUTES),
            },
            {
                path: 'member',
                loadChildren: () =>
                    import('./features/member/member.routes').then((m) => m.MEMBER_ROUTES),
            },

            // Demo 子服務示範
            // TODO: 下次 git merge 需移除
            {
                path: 'demo',
                loadChildren: () =>
                    import('./features/demo/demo.routes').then((m) => m.DEMO_ROUTES),
            },
        ]
    },
    // 管理員版型
    // NOTE: 當前開放僅是提醒性質，最終若無用途，須關閉。
    {
        path: 'admin',
        component: PublicLayoutComponent,
    },
    { path: '**', component: ErrorPageComponent },
];
