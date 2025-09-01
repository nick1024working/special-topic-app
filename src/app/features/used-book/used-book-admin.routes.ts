import { Routes } from '@angular/router';
import { PlaceholderPageComponent } from './pages/placeholder-page/placeholder-page.component';
import { AdminBookListPageComponent } from './pages/admin-book-list-page/admin-book-list-page.component';
import { AdminSaleTagPageComponent } from './pages/admin-sale-tag-page/admin-sale-tag-page.component';
import { TestPageComponent } from './pages/test-page/test-page.component';
import { MainAdminLayoutComponent } from './layouts/main-admin-layout/main-admin-layout.component';

export const USED_BOOK_ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: MainAdminLayoutComponent,
        children: [
            { path: '', component: PlaceholderPageComponent },
            { path: 'test', component: TestPageComponent },
            { path: 'books', component: AdminBookListPageComponent },
            { path: 'sale-tags', component: AdminSaleTagPageComponent },
        ]
    }
];
