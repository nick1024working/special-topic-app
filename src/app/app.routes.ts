import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { HomePageComponent } from './shared/pages/home-page/home-page.component';
import { ErrorPageComponent } from './shared/pages/error-page/error-page.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

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
            { path: '', component: HomePageComponent },

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
        ]
    },
    // 管理員版型
    {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [
            {
                path: 'used-book',
                loadChildren: () =>
                    import('./features/used-book/used-book-admin.routes').then((m) => m.USED_BOOK_ADMIN_ROUTES),
            },
        ]
    },
    { path: '**', component: ErrorPageComponent }

];
