import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

// TODO：換成你的環境設定，如：import { environment } from '../../../environments/environment';
// const API_BASE = `${environment.api}`;
const API_BASE = 'https://localhost:7104/api';

@Component({
  selector: 'app-member-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './member-login.component.html',
  styleUrl: './member-login.component.css'
})
export class MemberLoginComponent {
  loading = false;
  error = '';

  // 先宣告型別，不在這裡用 this.fb 初始化，避免「先用後宣告」錯誤
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // ✅ 在 constructor 內初始化，這時候 this.fb 已可用
    this.form = this.fb.group({
      account: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [true]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';

    const body = {
      account: this.f['account'].value as string,
      password: this.f['password'].value as string
    };

    this.http.post<any>(`${API_BASE}/users/login`, body, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    }).subscribe({
      next: (res) => {
        const token = res?.token as string;
        if (!token) {
          this.error = '登入回應缺少 token';
          this.loading = false;
          return;
        }
        const remember = !!this.f['remember'].value;
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('token', token);
        if (res.user) storage.setItem('user', JSON.stringify(res.user));

        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.error =
          (typeof err?.error === 'string' && err.error) ||
          err?.error?.message ||
          '登入失敗';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
