import { Routes } from '@angular/router';
import { HomePageComponent } from './shared/ui/pages/home-page/home-page.component';
import { BooklistComponent } from './features/used-book/booklist/booklist.component';
import { DetailComponent } from './features/used-book/detail/detail.component';
import { ErrorPageComponent } from './shared/ui/pages/error-page/error-page.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent },
    {
        path: 'used-books',
        children: [
            { path: '', component: BooklistComponent },
            { path: 'detail', component: DetailComponent },
            {
                path: 'lazy',
                loadComponent: () => import('./shared/ui/pages/lazy-page/lazy-page.component').then(m => m.LazyPageComponent)
            }
        ]
    },
    { path: '**', component: ErrorPageComponent },
];
