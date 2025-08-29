// src/app/features/fund/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    canActivate(): boolean {
        if (this.auth.isLoggedIn()) return true;
        alert('請先登入會員');
        this.router.navigate(['/login']); // 依你的實際登入路由調整
        return false;
    }
}
