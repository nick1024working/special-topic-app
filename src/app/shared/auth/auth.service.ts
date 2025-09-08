import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, firstValueFrom } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Me, LoginPayload } from './auth.types';

const API = 'https://localhost:7104/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);

    private _user$ = new BehaviorSubject<Me | null>(null);
    readonly user$ = this._user$.asObservable();

    private _inited$ = new BehaviorSubject<boolean>(false);
    readonly inited$ = this._inited$.asObservable();

    get user(): Me | null { return this._user$.value; }
    isLoggedIn(): boolean { return !!this._user$.value; }

    /** 後端會設 HttpOnly Cookie，這裡只更新前端 user 狀態 */
    login(payload: LoginPayload): Observable<void> {
        return this.http
            .post<{ user: Me }>(`${API}/users/login`, payload, { withCredentials: true })
            .pipe(
                tap(res => this._user$.next(res.user)),
                map(() => void 0)
            );
    }

    /** 取目前使用者（用 Cookie 驗證） */
    me(): Observable<Me | null> {
        return this.http
            .get<Me>(`${API}/users/me`, { withCredentials: true })
            .pipe(
                tap(u => this._user$.next(u)),
                map(u => u),
                catchError(() => {
                    this._user$.next(null);
                    return of(null);
                })
            );
    }

    logout(): Observable<void> {
        return this.http
            .post<void>(`${API}/users/logout`, {}, { withCredentials: true })
            .pipe(tap(() => this._user$.next(null)));
    }

    /** APP 啟動時叫一次，嘗試用 Cookie 還原登入狀態 */
    async boot(): Promise<void> {
        try {
            await firstValueFrom(this.me());
        } finally {
            this._inited$.next(true);
        }
    }
}
