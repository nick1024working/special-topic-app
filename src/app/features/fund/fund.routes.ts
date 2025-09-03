// fund.routes.ts
import { Routes, CanActivateFn, Router } from '@angular/router';
import { FundHomeComponent } from './fund-home/fund-home.component';
import { FundProjectComponent } from './fund-project/fund-project.component';
import { FundPitchComponent } from './fund-pitch/fund-pitch.component';
import { FundDetailComponent } from './fund-detail/fund-detail.component';
import { FundPlanComponent } from './fund-plan/fund-plan.component';
import { FundDoneComponent } from './fund-done/fund-done.component';
import { authGuard } from 'app/shared/auth/auth.guard';
import { FundPlanDoneComponent } from './fund-plan-done/fund-plan-done.component';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from 'app/shared/auth/auth.service';

const requireLogin: CanActivateFn = (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // 前端已知有登入就放行
    if (auth.isLoggedIn()) return true;

    // 可能剛刷新，保險再問後端一次 Cookie 狀態
    return auth.me().pipe(
        map(u => {
            if (u) return true;
            alert('請先登入會員');
            return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
        }),
        catchError(() => {
            alert('請先登入會員');
            return of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
        })
    );
};

export const FUND_ROUTES: Routes = [
    { path: '', redirectTo: 'fund-home', pathMatch: 'full' },
    { path: 'fund-home', component: FundHomeComponent },
    { path: 'fund-project', component: FundProjectComponent },
    { path: 'fund-detail/:id', component: FundDetailComponent },
    { path: 'fund-plan/:id', component: FundPlanComponent },
    { path: 'fund-pitch', component: FundPitchComponent, canActivate: [requireLogin] },
    { path: 'fund-done/:id', component: FundDoneComponent, canActivate: [authGuard] },
    { path: 'fund-plan-done/:projectId/:planId', component: FundPlanDoneComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: 'fund-home' },
];
