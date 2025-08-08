import { Routes } from '@angular/router';
import { HomePageComponent } from './shared/pages/home-page/home-page.component';
import { ErrorPageComponent } from './shared/pages/error-page/error-page.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent },
    {
        path: 'used-books',
        loadChildren: () =>
            import('./features/used-book/used-book.routes').then((m) => m.USED_BOOK_ROUTES),
    },
    { path: '**', component: ErrorPageComponent },
];
