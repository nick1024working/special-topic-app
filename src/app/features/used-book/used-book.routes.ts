import { PublicBookListPageComponent } from './pages/public-book-list-page/public-book-list-page.component';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';
import { CreateUsedBookPageComponent } from './pages/create-used-book-page/create-used-book-page.component';
import { PlaceholderPageComponent } from './pages/placeholder-page/placeholder-page.component';
import { TestPageComponent } from './pages/test-page/test-page.component';
import { PublicBookDetailPageComponent } from './pages/public-book-detail-page/public-book-detail-page.component';
import { Routes } from '@angular/router';
import { SellerBookListPageComponent } from './pages/seller-book-list-page/seller-book-list-page.component';
import { AdminBookListPageComponent } from './pages/admin-book-list-page/admin-book-list-page.component';
import { AdminSaleTagPageComponent } from './pages/admin-sale-tag-page/admin-sale-tag-page.component';
import { EditUsedBookPageComponent } from './pages/edit-used-book-page/edit-used-book-page.component';

export const USED_BOOK_ROUTES: Routes = [
    { path: '', component: PublicBookListPageComponent },
    { path: 'books', component: PublicBookListPageComponent },
    { path: 'books/:id', component: PublicBookDetailPageComponent },
    { path: 'new', component: CreateUsedBookPageComponent },
    { path: 'demo/books', component: ProductListPageComponent },
    {
        path: 'seller',
        children: [
            { path: '', redirectTo: 'books', pathMatch: 'full' },
            { path: 'books', component: SellerBookListPageComponent },
            { path: 'books/edit/:id', component: EditUsedBookPageComponent },
        ],
    },
    {
        path: 'admin',
        children: [
            { path: '', redirectTo: 'books', pathMatch: 'full' },
            { path: 'books', component: AdminBookListPageComponent },
            { path: 'sale-tags', component: AdminSaleTagPageComponent },
        ],
    },
    { path: 'test', component: TestPageComponent },
];
