// fund.routes.ts
import { Routes } from '@angular/router';
import { FundHomeComponent } from './fund-home/fund-home.component';
import { FundProjectComponent } from './fund-project/fund-project.component';
import { FundPitchComponent } from './fund-pitch/fund-pitch.component';
import { FundDetailComponent } from './fund-detail/fund-detail.component';
import { FundPlanComponent } from './fund-plan/fund-plan.component';
import { FundDoneComponent } from './fund-done/fund-done.component';
import { AuthGuard } from './auth.guard';
import { FundPlanDoneComponent } from './fund-plan-done/fund-plan-done.component';

export const FUND_ROUTES: Routes = [
    { path: '', redirectTo: 'fund-home', pathMatch: 'full' },
    { path: 'fund-home', component: FundHomeComponent },
    { path: 'fund-project', component: FundProjectComponent },
    { path: 'fund-detail/:id', component: FundDetailComponent },
    { path: 'fund-plan/:id', component: FundPlanComponent },
    { path: 'fund-pitch', component: FundPitchComponent, canActivate: [AuthGuard] },
    { path: 'fund-done/:id', component: FundDoneComponent, canActivate: [AuthGuard] },
    { path: 'fund-plan-done/:projectId/:planId', component: FundPlanDoneComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'fund-home' },
];
