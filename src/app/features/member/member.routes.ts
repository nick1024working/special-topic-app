// src/app/features/member/member.routes.ts
import { Routes } from '@angular/router';
import { MemberLoginComponent } from './member-login/member-login.component';
import { MemberRegisterComponent } from './member-register/member-register.component';
import { MemberDetailsComponent } from './member-details/member-details.component';
import { authGuard } from '../../shared/auth/auth.guard'; // 依你的實際路徑

export const MEMBER_ROUTES: Routes = [
  // 公開頁：不需登入
  { path: 'login', component: MemberLoginComponent, title: '會員登入' },
  { path: 'register', component: MemberRegisterComponent, title: '會員註冊' },

  // 需要登入的頁面統一掛在 canActivateChild
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      { path: 'profile', component: MemberDetailsComponent, title: '會員資料' },
      // 其它需要登入的會員頁也放這裡
    ],
  },

  // /member 直接導到 /member/login
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'forgot', loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset',  loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
];
