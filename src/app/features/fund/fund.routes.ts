// fund.routes.ts
import { Routes } from '@angular/router';
import { FundHomeComponent } from './fund-home/fund-home.component';
import { FundProjectComponent } from './fund-project/fund-project.component';
import { FundPitchComponent } from './fund-pitch/fund-pitch.component';
import { FundDetailComponent } from './fund-detail/fund-detail.component';

export const FUND_ROUTES: Routes = [
    { path: '', redirectTo: 'fund-home', pathMatch: 'full' },
    { path: 'fund-home', component: FundHomeComponent },
    { path: 'fund-project', component: FundProjectComponent },
    { path: 'fund-pitch', component: FundPitchComponent },
    { path: 'fund-detail/:id', component: FundDetailComponent },
    { path: '**', redirectTo: 'fund-home' },
];
