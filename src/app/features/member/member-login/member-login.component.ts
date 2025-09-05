import { Component } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../../../shared/auth/auth.service';
import { LoginPayload } from '../../../shared/auth/auth.types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-member-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RouterLink],
  templateUrl: './member-login.component.html',
  styleUrl: './member-login.component.css'
})
export class MemberLoginComponent {
    loading = false;
    error = '';
    form!: FormGroup;
    private returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private viewport: ViewportScroller
  ) {
    this.form = this.fb.group({
      account: ['', [Validators.required]],
      // 後端允許「舊密碼五碼」→ 不加 minLength(6) 以免前端擋住
      password: ['', [Validators.required]],
      remember: [true]
    });
  }

    ngOnInit(): void {
        this.viewport.scrollToPosition([0, 0]);

    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

    const remembered = localStorage.getItem('login_account');
    if (remembered) this.form.patchValue({ account: remembered });
  }

    get f() { return this.form.controls; }

    onSubmit() {
        if (this.form.invalid || this.loading) return;

        this.loading = true;
        this.error = '';

        const payload: LoginPayload = {
            account: this.f['account'].value,
            password: this.f['password'].value
        };

    this.auth.login(payload).subscribe({
      next: () => {
        if (this.f['remember'].value) {
          localStorage.setItem('login_account', payload.account);
        } else {
          localStorage.removeItem('login_account');
        }
        this.router.navigateByUrl(this.returnUrl || '/');
      },
      error: (err) => {
        this.error =
          (typeof err?.error === 'string' && err.error) ||
          err?.error?.message ||
          '登入失敗';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }

  goRegister() {
    this.router.navigate(['/member/register']);
  }
}
