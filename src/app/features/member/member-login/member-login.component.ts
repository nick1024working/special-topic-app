import { Component } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';

import { AuthService } from '../../../shared/auth/auth.service';   // ← 路徑依照你的結構
import { LoginPayload } from '../../../shared/auth/auth.types';

@Component({
    selector: 'app-member-login',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
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
            password: ['', [Validators.required, Validators.minLength(6)]],
            remember: [true]
        });
    }

    ngOnInit(): void {
        this.viewport.scrollToPosition([0, 0]);

        // 若由 Guard 帶回的 returnUrl，登入後導回
        this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

        // 可選：帶入記住的帳號（不是 token）
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
                // 記住帳號（可選），絕不存 JWT
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
}
