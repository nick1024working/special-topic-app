import { PlaceholderPageComponent } from './pages/placeholder-page/placeholder-page.component';
import { Routes } from '@angular/router';
import { BooklistComponent } from 'app/features/used-book/component/booklist/booklist.component';
import { DetailComponent } from 'app/features/used-book/detail/detail.component';
import { ProductListPageComponent } from 'app/features/used-book/pages/product-list-page/product-list-page.component';
import { CreateUsedBookPageComponent } from 'app/features/used-book/pages/create-used-book-page/create-used-book-page.component';

export const USED_BOOK_ROUTES: Routes = [
    { path: '', component: BooklistComponent },
    { path: 'books/:id', component: DetailComponent },
    { path: 'new', component: CreateUsedBookPageComponent },
    { path: 'products', component: ProductListPageComponent },
    {
        path: 'admin',
        children: [
            { path: '', redirectTo: 'books', pathMatch: 'full' },
            { path: 'books', component: PlaceholderPageComponent },
        ],
     }
];
