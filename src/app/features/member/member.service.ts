import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MemberService {
  //  後端實際位址（你也可以放到 environment.ts）
  private api = 'https://localhost:7104/api/Users';

  constructor(private http: HttpClient) {}

  // 乾淨化 token（移除引號與零寬字元）
private cleanToken(raw: string): string {
  let t = (raw ?? '').trim();
  try { t = decodeURIComponent(t); } catch {}
  return t
    .replace(/^[<>'"]|[<>'"]$/g, '')               // 去掉首尾 < > ' "
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '');

  // 如果網址被 encode 過，先嘗試解碼一次（避免雙重編碼）
  try { t = decodeURIComponent(t); } catch {}

  return t
    .replace(/^[\'"]|[\'"]$/g, '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '');
}

  /**  忘記密碼：後端可能回 204，這裡轉成 boolean 方便 UI 使用 */
  forgotPassword(accountOrEmail: string): Observable<boolean> {
    return this.http
      .post<void>(`${this.api}/forgot-password`, { accountOrEmail }, { observe: 'response' })
      .pipe(map(() => true));
  }

  /**  驗證 token：用 HttpParams，會自動做 URL encode */
  validateResetToken(token: string): Observable<any> {
    const params = new HttpParams().set('token', this.cleanToken(token));
    return this.http.get(`${this.api}/reset-password/validate`, { params });
  }

  /**  送出重設密碼：token 放 body，不必再 encode，但仍先清洗 */
  resetPassword(token: string, newPwd: string, confirmPwd: string): Observable<void> {
    const t = this.cleanToken(token);
    return this.http.post<void>(`${this.api}/reset-password`, {
      token: t,
      newPassword: newPwd,
      confirmPassword: confirmPwd,
    });
  }
}
