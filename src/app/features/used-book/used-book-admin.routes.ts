import { Routes } from '@angular/router';
import { PlaceholderPageComponent } from './pages/placeholder-page/placeholder-page.component';
import { AdminBookListPageComponent } from './pages/admin-book-list-page/admin-book-list-page.component';
import { AdminSaleTagPageComponent } from './pages/admin-sale-tag-page/admin-sale-tag-page.component';

export const USED_BOOK_ADMIN_ROUTES: Routes = [
    { path: '', component: PlaceholderPageComponent },
    { path: 'books', component: AdminBookListPageComponent },
    { path: 'sale-tags', component: AdminSaleTagPageComponent },
];
