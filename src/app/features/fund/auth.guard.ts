import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
    constructor(private auth: AuthService, private router: Router) { }
    canActivate(): boolean {
        const ok = this.auth.isLoggedIn();
        console.log('[AuthGuard] isLoggedIn:', ok, 'token:', this.auth.getToken(), 'uid:', this.auth.getUid());
        if (!ok) alert('請先登入會員');
        return ok;
    }
}
