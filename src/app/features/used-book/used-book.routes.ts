import { PublicBookListPageComponent } from './pages/public-book-list-page/public-book-list-page.component';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';
import { CreateUsedBookPageComponent } from './pages/create-used-book-page/create-used-book-page.component';
import { TestPageComponent } from './pages/test-page/test-page.component';
import { PublicBookDetailPageComponent } from './pages/public-book-detail-page/public-book-detail-page.component';
import { Routes } from '@angular/router';
import { SellerBookListPageComponent } from './pages/seller-book-list-page/seller-book-list-page.component';
import { AdminBookListPageComponent } from './pages/admin-book-list-page/admin-book-list-page.component';
import { AdminSaleTagPageComponent } from './pages/admin-sale-tag-page/admin-sale-tag-page.component';
import { EditUsedBookPageComponent } from './pages/edit-used-book-page/edit-used-book-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { UserOrderListPageComponent } from './pages/user-order-list-page/user-order-list-page.component';

export const USED_BOOK_ROUTES: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomePageComponent, title: "二手書 | ProBookLand" },
            { path: 'books', component: PublicBookListPageComponent, title: "全部分類 | 二手書 | ProBookLand" },
            { path: 'books/:id', component: PublicBookDetailPageComponent },
            { path: 'new', component: CreateUsedBookPageComponent },
            { path: 'demo/books', component: ProductListPageComponent },
            {
                path: 'seller',
                children: [
                    { path: '', redirectTo: 'books', pathMatch: 'full' },
                    { path: 'books', component: SellerBookListPageComponent, title: "賣家書本列表 | 二手書 | ProBookLand" },
                    { path: 'books/edit/:id', component: EditUsedBookPageComponent, title: "編輯書本 | 二手書 | ProBookLand" },
                ],
            },
            {
                path: 'user',
                children: [
                    { path: '', redirectTo: 'books', pathMatch: 'full' },
                    { path: 'orders', component: UserOrderListPageComponent, title: "使用者訂單列表 | 二手書 | ProBookLand" },
                ],
            },
            {
                path: 'admin',
                children: [
                    { path: '', redirectTo: 'books', pathMatch: 'full' },
                    { path: 'books', component: AdminBookListPageComponent, title: "管理員書本列表 | 二手書 | ProBookLand 管理中心" },
                    { path: 'sale-tags', component: AdminSaleTagPageComponent, title: "管理促銷標籤 | 二手書 | ProBookLand 管理中心" },
                ],
            },
            { path: 'test', component: TestPageComponent },
        ]
    }
];
