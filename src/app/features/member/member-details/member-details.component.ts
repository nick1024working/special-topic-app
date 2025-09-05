import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, Validators, AbstractControl, ValidationErrors,
  ReactiveFormsModule, FormGroup,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

type Me = {
  uid: string; name: string; email: string; phone: string;
  address?: string; birthday?: string; avatarUrl?: string;
  status?: number; level?: number;
};

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member-details.component.html',
  // 只在本元件覆蓋，把 .text-secondary 改成紫色（Bootstrap 紫 #6f42c1）
  styles: [`
    :host .text-secondary { color: #6f42c1 !important; }
    /* 簡易彈窗樣式 */
    .modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);
      display:flex;align-items:center;justify-content:center;z-index:1050;}
    .modal-card{background:#fff;border-radius:14px;padding:24px 22px;
      width:min(420px,calc(100% - 32px));box-shadow:0 14px 40px rgba(0,0,0,.25);}
  `]
})
export class MemberDetailsComponent implements OnInit, OnDestroy {
  apiRoot = (environment as any).apiBaseUrl?.replace(/\/$/, '') || 'https://localhost:7104';
  API_BASE = `${this.apiRoot}/api`;

  me?: Me;
  error = '';
  ok = '';
  savingAll = false;

  addrForm!: FormGroup;
  pwdForm!: FormGroup;

  // === 成功彈窗 + 倒數 ===
  showSuccess = false;
  successMsg = '變更成功！即將回到首頁';
  countdown = 3;
  private countdownTimer?: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) {
    this.addrForm = this.fb.group({ address: ['', [Validators.minLength(6)]] });
    this.pwdForm = this.fb.group(
      { oldPassword: [''], newPassword: ['', [passwordPolicyValidatorOptional]], confirmPassword: [''] },
      { validators: [matchValidator('newPassword', 'confirmPassword')] }
    );
  }

  ngOnInit(): void { this.loadMe(); }
  ngOnDestroy(): void { this.clearCountdown(); }

  loadMe() {
    this.http.get<Me>(`${this.API_BASE}/Users/me`, { withCredentials: true }).subscribe({
      next: (me) => { this.me = me; this.addrForm.reset({ address: '' }); this.pwdForm.reset(); },
      error: (e) => this.error = parseErr(e)
    });
  }

  avatarFullUrl() {
    if (!this.me?.avatarUrl) return 'assets/images/default-avatar.png';
    return this.apiRoot + this.me.avatarUrl;
  }

  onAvatarSelected(ev: Event) {
    if (!this.me) return;
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const fd = new FormData(); fd.append('file', input.files[0]);
    this.http.post<{ avatarUrl: string }>(`${this.API_BASE}/Users/upload-avatar`, fd, { withCredentials: true })
      .subscribe({
        next: (res) => { this.ok = '大頭貼已更新'; this.error = ''; this.me!.avatarUrl = res.avatarUrl; },
        error: (e) => { this.error = parseErr(e); this.ok = ''; }
      });
    input.value = '';
  }

  async saveAll() {
    this.error = ''; this.ok = ''; this.savingAll = true;
    try {
      // 地址
      const addr = (this.addrForm.value.address || '').toString().trim();
      if (addr.length > 0 && this.addrForm.valid && this.me) {
        await firstValueFrom(this.http.put(`${this.API_BASE}/Users/${this.me.uid}`, { address: addr }, { withCredentials: true }));
      }
      // 密碼（只要任一欄有填，就檢查三欄）
      const p = this.pwdForm.value as any;
      const anyPwdFilled = !!(p.oldPassword || p.newPassword || p.confirmPassword);
      if (anyPwdFilled) {
        if (!p.oldPassword || !p.newPassword || !p.confirmPassword) throw { error: '請完整填寫三個密碼欄位' };
        const weak = passwordPolicyValidator({ value: p.newPassword } as AbstractControl);
        if (weak) throw { error: '新密碼需至少 8 碼，且同時包含英文與數字' };
        if (this.pwdForm.errors?.['mismatch']) throw { error: '兩次新密碼不一致' };
        await firstValueFrom(this.http.post(`${this.API_BASE}/Users/change-password`, p, { withCredentials: true }));
        this.pwdForm.reset();
      }

      if (!anyPwdFilled && addr.length === 0) {
        this.ok = '沒有需要更新的項目';
      } else {
        // ✅ 顯示彈窗 + 倒數
        this.loadMe();
        this.startSuccessModal(3);   // 3 秒後回首頁
      }
    } catch (e: any) {
      this.error = parseErr(e);
    } finally {
      this.savingAll = false;
    }
  }

  // yyyy-MM-dd → yyyy/MM/dd
  formatBirthday(b?: string): string {
    if (!b) return '（尚未填寫）';
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(b);
    if (m) { const y = +m[1], mo = +m[2], d = +m[3]; return `${y}/${String(mo).padStart(2,'0')}/${String(d).padStart(2,'0')}`; }
    return b;
  }

  resetForms() { this.addrForm.reset({ address: '' }); this.pwdForm.reset(); this.error = ''; this.ok = ''; }

  disableAccount() {
    if (!this.me) return;
    if (!confirm('確定要停用帳號嗎？')) return;
    this.http.delete(`${this.API_BASE}/Users/${this.me.uid}`, { withCredentials: true }).subscribe({
      next: () => { this.ok = '帳號已停用'; this.error = ''; },
      error: (e) => { this.error = parseErr(e); this.ok = ''; }
    });
  }

  logout() {
    this.http.post(`${this.API_BASE}/Users/logout`, {}, { withCredentials: true }).subscribe({
      next: () => { window.location.assign('/'); },   // 方案 A：整頁刷新，Navbar 一定更新
      error: (e) => this.error = parseErr(e)
    });
  }

  // ====== 彈窗 + 倒數 ======
  private clearCountdown() { if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = undefined; } }
  startSuccessModal(seconds = 3) {
    this.clearCountdown();
    this.countdown = seconds;
    this.showSuccess = true;
    this.countdownTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) this.confirmSuccess();
    }, 1000);
  }
  confirmSuccess() {
    this.clearCountdown();
    this.showSuccess = false;
    this.router.navigateByUrl('/');  // 這裡用 Router 導回首頁即可
  }
}

/* ========= 驗證器 ========= */
export function passwordPolicyValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v = (ctrl.value || '') as string;
  if (v.length < 8) return { passwordWeak: true };
  if (!/[A-Za-z]/.test(v)) return { passwordWeak: true };
  if (!/[0-9]/.test(v)) return { passwordWeak: true };
  return null;
}
export function passwordPolicyValidatorOptional(ctrl: AbstractControl): ValidationErrors | null {
  const v = (ctrl.value || '') as string; if (!v) return null; return passwordPolicyValidator(ctrl);
}
export function matchValidator(a: string, b: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const A = group.get(a)?.value, B = group.get(b)?.value;
    return A && B && A !== B ? { mismatch: true } : null;
  };
}
function parseErr(e: any): string { return e?.error?.message || e?.error || e?.statusText || '發生錯誤'; }
