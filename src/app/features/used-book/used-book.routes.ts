import { PublicBookDetailComponent } from './components/public-book-detail/public-book-detail.component';
import { PublicBookListPageComponent } from './pages/public-book-list-page/public-book-list-page.component';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';
import { CreateUsedBookPageComponent } from './pages/create-used-book-page/create-used-book-page.component';
import { PlaceholderPageComponent } from './pages/placeholder-page/placeholder-page.component';
import { TestPageComponent } from './pages/test-page/test-page.component';
import { Routes } from '@angular/router';

export const USED_BOOK_ROUTES: Routes = [
    { path: '', component: PublicBookListPageComponent },
    { path: 'books/:id', component: PublicBookDetailComponent },
    { path: 'new', component: CreateUsedBookPageComponent },
    { path: 'products', component: ProductListPageComponent },
    {
        path: 'admin',
        children: [
            { path: '', redirectTo: 'books', pathMatch: 'full' },
            { path: 'books', component: PlaceholderPageComponent },
        ],
     },
     { path: 'test', component: TestPageComponent },
];
