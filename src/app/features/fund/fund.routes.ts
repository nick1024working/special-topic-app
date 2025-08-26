// fund.routes.ts
import { Routes } from '@angular/router';
import { FundHomeComponent } from './fund-home/fund-home.component';
import { FundProjectComponent } from './fund-project/fund-project.component';
import { FundPitchComponent } from './fund-pitch/fund-pitch.component';
import { FundDetailComponent } from './fund-detail/fund-detail.component';
import { FundPlanComponent } from './fund-plan/fund-plan.component';
import { FundDoneComponent } from './fund-done/fund-done.component';

export const FUND_ROUTES: Routes = [
    { path: '', redirectTo: 'fund-home', pathMatch: 'full' },
    { path: 'fund-home', component: FundHomeComponent },
    // 專案列表
    { path: 'fund-project', component: FundProjectComponent },

    // 專案詳情
    { path: 'fund-detail/:id', component: FundDetailComponent },

    // 方案頁（這條是你要導到的）
    { path: 'fund-plan/:id', component: FundPlanComponent },
    { path: 'fund-pitch', component: FundPitchComponent },
    { path: 'fund-done/:id', component: FundDoneComponent },
    { path: '**', redirectTo: 'fund-home' },
];
