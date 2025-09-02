import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface LoginRequest { account: string; password: string; }
export interface AuthUser { uid: string;[k: string]: any; }
export interface LoginResponse { token: string; user: AuthUser; }

@Injectable({ providedIn: 'root' })
export class AuthService {

    private readonly TOKEN_KEY = 'auth_token';
    private readonly UID_KEY = 'auth_uid';


    private readonly EXT_TOKEN_KEYS = ['token', 'authToken'];
    private readonly EXT_USER_KEYS = ['user', 'auth_user'];

    private tokenSig = signal<string | null>(null);
    private uidSig = signal<string | null>(null);

    constructor(private http: HttpClient) {
        this.hydrateFromOwnStorage();
        this.hydrateFromExternalStores();
    }

    /** ---- 供登入畫面（若你之後自己做）呼叫的 API ---- */
    login(payload: LoginRequest) {
        return this.http.post<LoginResponse>('/api/Users/login', payload).pipe(
            tap(res => {
                const uid = res?.user?.uid?.toString?.();
                if (res?.token && uid) this.setAuth(res.token, uid);
            })
        );
    }

    /** ---- 公用狀態 ---- */
    isLoggedIn(): boolean {
        this.hydrateFromExternalStores();
        return !!(this.tokenSig() && this.uidSig());
    }

    getToken(): string | null {
        this.hydrateFromExternalStores();
        return this.tokenSig();
    }

    getUid(): string | null {
        this.hydrateFromExternalStores();
        return this.uidSig();
    }

    /** 正規寫入（預設存 localStorage） */
    setAuth(token: string, uid: string, remember = true): void {
        const storage = remember ? localStorage : sessionStorage;
        try {
            storage.setItem(this.TOKEN_KEY, token);
            storage.setItem(this.UID_KEY, uid);
        } catch { }
        this.tokenSig.set(token);
        this.uidSig.set(uid);
    }

    clearAuth(): void {
        try {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.UID_KEY);
            sessionStorage.removeItem(this.TOKEN_KEY);
            sessionStorage.removeItem(this.UID_KEY);
        } catch { }
        this.tokenSig.set(null);
        this.uidSig.set(null);
    }

    /** 未登入時統一提示 */
    requireLogin(): boolean {
        if (this.isLoggedIn()) return true;
        alert('請先登入會員');
        return false;
    }

    /**  內部：從自己 key 讀（localStorage / sessionStorage 都支援） */
    private hydrateFromOwnStorage() {
        const t = this.firstHit([localStorage, sessionStorage], this.TOKEN_KEY);
        const u = this.firstHit([localStorage, sessionStorage], this.UID_KEY);
        if (t) this.tokenSig.set(t);
        if (u) this.uidSig.set(u);
    }

    /** 內部：橋接組員登入頁的 key，找到就自動遷移到自己的 key  */
    private hydrateFromExternalStores() {
        if (this.tokenSig() && this.uidSig()) return; // 已經有了就不用每次做

        // 找 token
        let token: string | null = null;
        for (const k of this.EXT_TOKEN_KEYS) {
            token = this.firstHit([localStorage, sessionStorage], k);
            if (token) break;
        }

        // 找 user 並取 uid
        let uid: string | null = null;
        for (const k of this.EXT_USER_KEYS) {
            const raw = this.firstHit([localStorage, sessionStorage], k);
            if (!raw) continue;
            try {
                const user = JSON.parse(raw);
                uid = (user?.uid ?? user?.id ?? user?.userId)?.toString?.() ?? null;
                if (uid) break;
            } catch { /* ignore parse error */ }
        }

        // 如果都有，統一寫回自己的 key，之後整站都用同一套
        if (token && uid) this.setAuth(token, uid, true);
    }

    /** 從多個 storage 中取第一個命中的 key 值 */
    private firstHit(storages: Storage[], key: string): string | null {
        for (const s of storages) {
            try {
                const v = s.getItem(key);
                if (v) return v;
            } catch { /* ignore */ }
        }
        return null;
    }
}
