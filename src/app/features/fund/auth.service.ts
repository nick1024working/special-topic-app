// src/app/features/fund/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginUser {
    uid: string;        // 後端 Users 的 UID（GUID字串）
    name?: string;
    email?: string;
    token?: string;     // 若你們有 JWT，可放這裡（可選）
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly KEY = 'auth_user';
    private _user$ = new BehaviorSubject<LoginUser | null>(this.read());

    /** 目前登入者（可能為 null） */
    readonly user$ = this._user$.asObservable();

    constructor(private router: Router) { }

    /** 是否登入 */
    isLoggedIn(): boolean {
        return !!this._user$.value;
    }

    /** 目前 UID（未登入則回 null） */
    uid(): string | null {
        return this._user$.value?.uid ?? null;
    }

    /** 需要 UID；若未登入則提示並導到登入頁，回 null 交由呼叫端停止流程 */
    requireUidOrRedirect(message = '請先登入會員'): string | null {
        const id = this.uid();
        if (id) return id;
        alert(message);
        this.router.navigate(['/login']); // 依你的實際登入路由調整
        return null;
    }

    /** —— 下列為「登入/登出」範例 —— */

    loginMock(uid: string, name?: string, email?: string) {
        // ⚠️ 這是示範：實務上你會改成呼叫你們 Users/Login API 拿回 user + token
        const user: LoginUser = { uid, name, email };
        localStorage.setItem(this.KEY, JSON.stringify(user));
        this._user$.next(user);
    }

    logout() {
        localStorage.removeItem(this.KEY);
        this._user$.next(null);
        this.router.navigate(['/']); // 回首頁或登入頁
    }

    private read(): LoginUser | null {
        try {
            const raw = localStorage.getItem(this.KEY);
            return raw ? JSON.parse(raw) as LoginUser : null;
        } catch { return null; }
    }
}
