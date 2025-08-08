import { Routes } from '@angular/router';
import { DemoEmptyPageComponent } from './pages/demo-empty-page/demo-empty-page.component';
import { DemoProductListPageComponent } from './pages/demo-product-list-page/demo-product-list-page.component';

export const DEMO_ROUTES: Routes = [
    // 注意此處若不指定完全對比，則可能導致迴圈，
    // 對比成功 => 導到無效路由 => 無效路由剛好 fall back 回最初的路由 => 迴圈。
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', component: DemoProductListPageComponent },
    { path: '**', component: DemoEmptyPageComponent },
];
