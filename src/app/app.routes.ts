import { Routes } from '@angular/router';
import { HomePageComponent } from './shared/pages/home-page/home-page.component';
import { ErrorPageComponent } from './shared/pages/error-page/error-page.component';

/** 主路由 */
// 此處把各子服務路由分開管理，減少衝突。
// NOTE: wildcard 放在最後匹配。
export const routes: Routes = [
    { path: '', component: HomePageComponent },
    // 這是給 Demo 子服務用的
    {
        path: 'demo',
        loadChildren: () =>
            import('./features/demo/demo.routes').then((m) => m.DEMO_ROUTES),
    },
    // 這是給 Used-book 子服務用的
    {
        path: 'used-books',
        loadChildren: () =>
            import('./features/used-book/used-book.routes').then((m) => m.USED_BOOK_ROUTES),
    },
    { path: '**', component: ErrorPageComponent },
];
