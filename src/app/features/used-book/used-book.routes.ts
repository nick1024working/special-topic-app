import { PublicBookListPageComponent } from './pages/public-book-list-page/public-book-list-page.component';
import { TestPageComponent } from './pages/test-page/test-page.component';
import { PublicBookDetailPageComponent } from './pages/public-book-detail-page/public-book-detail-page.component';
import { Routes } from '@angular/router';
import { AdminBookListPageComponent } from './pages/admin-book-list-page/admin-book-list-page.component';
import { AdminSaleTagPageComponent } from './pages/admin-tag-and-category-page/admin-tag-and-category-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { MainPublicLayoutComponent } from './layouts/main-public-layout/main-public-layout.component';
import { CheckoutResultPageComponent } from './pages/checkout-result-page/checkout-result-page.component';

export const USED_BOOK_ROUTES: Routes = [
    {
        path: '',
        component: MainPublicLayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomePageComponent, title: "二手書 | ProBookLand" },
            { path: 'books', component: PublicBookListPageComponent, title: "全部分類 | 二手書 | ProBookLand" },
            { path: 'books/:id', component: PublicBookDetailPageComponent },
            {
                path: 'admin',
                children: [
                    { path: '', redirectTo: 'books', pathMatch: 'full' },
                    { path: 'books', component: AdminBookListPageComponent, title: "管理員書本列表 | 二手書 | ProBookLand 管理中心" },
                    { path: 'sale-tags', component: AdminSaleTagPageComponent, title: "管理促銷標籤 | 二手書 | ProBookLand 管理中心" },
                ],
            },
            { path: 'checkout-result', component: CheckoutResultPageComponent, title: "訂單結果 | ProBookLand" },
            { path: 'test', component: TestPageComponent },
        ]
    }
];
