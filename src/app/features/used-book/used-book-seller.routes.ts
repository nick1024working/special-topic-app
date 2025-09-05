import { Routes } from '@angular/router';
import { SellerBookListPageComponent } from './pages/seller-book-list-page/seller-book-list-page.component';
import { UserOrderListPageComponent } from './pages/user-order-list-page/user-order-list-page.component';
import { CreateUsedBookPageComponent } from './pages/create-used-book-page/create-used-book-page.component';
import { EditUsedBookPageComponent } from './pages/edit-used-book-page/edit-used-book-page.component';
import { UserOrderDetailPageComponent } from './pages/user-order-detail-page/user-order-detail-page.component';

export const USED_BOOK_SELLER_ROUTES: Routes = [
    { path: '', redirectTo: 'books', pathMatch: 'full' },
    { path: 'books', component: SellerBookListPageComponent, title: "賣家書本管理 | ProBookLand 賣家中心" },
    { path: 'books/new', component: CreateUsedBookPageComponent, title: "新增書本 | ProBookLand 賣家中心" },
    { path: 'books/edit/:id', component: EditUsedBookPageComponent, title: "編輯書本 | ProBookLand 賣家中心" },
    { path: 'orders', component: UserOrderListPageComponent, title: "訂單管理 | ProBookLand 賣家中心" },
    { path: 'orders/:orderNo', component: UserOrderDetailPageComponent, title: "訂單詳情 | ProBookLand 賣家中心" },
];
