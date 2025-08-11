// fund.routes.ts
import { Routes } from '@angular/router';
import { FundHomeComponent } from './fund-home/fund-home.component';
import { FundProjectComponent } from './fund-project/fund-project.component';
import { FundPitchComponent } from './fund-pitch/fund-pitch.component';
import { FundDetailComponent } from './fund-detail/fund-detail.component';

export const FUND_ROUTES: Routes = [
    // 預設導到首頁
    { path: '', redirectTo: 'fund-home', pathMatch: 'full' },

    // 主頁面
    { path: 'fund-home', component: FundHomeComponent },       // 首頁
    { path: 'fund-project', component: FundProjectComponent }, // 探索列表
    { path: 'fund-pitch', component: FundPitchComponent },     // 提案頁

    // 詳細頁（從探索點進來）
    { path: 'fund-detail/:id', component: FundDetailComponent },

    // 萬用導回首頁
    { path: '**', redirectTo: 'fund-home' },
];
