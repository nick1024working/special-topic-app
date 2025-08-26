import { Routes } from '@angular/router';
import { MemberDetailsComponent } from './member-details/member-details.component';

export const MEMBER_ROUTES: Routes = [
    // 進 /member 預設導到 login
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // 登入
    {
        path: 'login',
        loadComponent: () =>
            import('./member-login/member-login.component')
                .then(m => m.MemberLoginComponent),
    },

    // 註冊
    {
        path: 'register',
        loadComponent: () =>
            import('./member-register/member-register.component')
                .then(m => m.MemberRegisterComponent),
    },

    // 個資頁
    { path: 'profile', component: MemberDetailsComponent },

    // 萬用路由
    { path: '**', redirectTo: 'login' },
];
