import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

const API_ROOT = environment.apiBaseUrl?.replace(/\/$/, '') || 'https://localhost:7104';
const API_BASE = `${API_ROOT}/api`;

@Component({
  selector: 'app-member-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './member-register.component.html',
  styleUrl: './member-register.component.css'
})
export class MemberRegisterComponent {
  form!: FormGroup;
  loading = false;
  error = '';
  okMsg = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        // 手機：台灣行動電話 09xxxxxxxx
        phone: ['', [Validators.required, Validators.pattern(/^09\d{8}$/)]],

        // 姓名：純中文、至少兩個字
        name: ['', [Validators.required, Validators.pattern(/^[\u4e00-\u9fa5]{2,}$/)]],

        // Email
        email: ['', [Validators.required, Validators.email]],

        // 密碼：至少 8 碼，含英文與數字
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
          ]
        ],
        confirm: ['', Validators.required],

        // 性別：預設 true(男)
        gender: [true, [Validators.required]],

        address: [''],
        birthday: ['2000-01-01', [Validators.required]],

        // 其餘預設
        status: [1],
        level: [1],
        isAuthor: [false],
      },
      { validators: this.matchPwd }
    );
  }

  // 驗證：兩次密碼一致
  private matchPwd(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value;
    const c = group.get('confirm')?.value;
    return p === c ? null : { mismatch: true };
  }

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid || this.loading) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = ''; this.okMsg = '';

    const g = this.f['gender'].value;
    const genderBool = (g === true || g === 'true');

    const body = {
      phone: (this.f['phone'].value as string).trim(),
      password: this.f['password'].value as string,
      name: (this.f['name'].value as string).trim(),
      email: (this.f['email'].value as string).trim(),
      gender: genderBool,
      birthday: this.f['birthday'].value as string, // yyyy-MM-dd
      address: (this.f['address'].value as string).trim(),

      status: Number(this.f['status'].value) || 1,
      level: Number(this.f['level'].value) || 1,
      isAuthor: !!this.f['isAuthor'].value,
    };

    this.http.post(`${API_BASE}/Users/register`, body, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
      // 註冊不需要 cookie，但帶了也不影響：
      // , withCredentials: true
    }).subscribe({
      next: () => {
        this.okMsg = '註冊成功！將帶您前往登入頁…';
        setTimeout(() => this.router.navigateByUrl('/member/login'), 1200);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 0) {
          this.error = '無法連線到 API（可能是 CORS、HTTPS 憑證未信任、API 未啟動、或網址/port 錯誤）';
        } else {
          this.error =
            (typeof err.error === 'string' && err.error) ||
            err.error?.message ||
            `${err.status} ${err.statusText}`;
        }
        console.error('Register error:', err);
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }

  goLogin() {
    this.router.navigate(['/member/login']);
  }
}
