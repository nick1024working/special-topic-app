import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

const API_BASE = 'https://localhost:7104/api';

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

                // Email：要有 @，交給 Angular 內建 email 驗證
                email: ['', [Validators.required, Validators.email]],

                // 密碼：至少 6 個「數字」，輸入時為星號
                password: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{6,}$/)]],
                confirm: ['', [Validators.required]],

                // 性別：勾選框／單選；預設男（true）
                gender: [true, [Validators.required]],

                // 地址：至少六個「中文」字，可含數字（用客製驗證計算中文字數）
                address: ['',],

                // 生日：預設 2000-01-01
                birthday: ['2000-01-01', [Validators.required]],

                // 以下為後端預設（不顯示在頁面也可，但放在 form 方便送出）
                status: [1],       // 啟用
                level: [1],        // 等級 1
                isAuthor: [false], // 是否作家：否
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

    // 驗證：至少 N 個「中文」字
    private atLeastNChinese = (n: number) => (control: AbstractControl): ValidationErrors | null => {
        const v = (control.value ?? '') as string;
        const matches = v.match(/[\u4e00-\u9fa5]/g);
        const count = matches ? matches.length : 0;
        return count >= n ? null : { zhTooShort: { need: n, got: count } };
    };

    get f() { return this.form.controls; }

    submit() {
        if (this.form.invalid || this.loading) { this.form.markAllAsTouched(); return; }
        this.loading = true;
        this.error = ''; this.okMsg = '';

        const g = this.f['gender'].value;                   // 可能是 'true' / 'false' 或 boolean
        const genderBool = (g === true || g === 'true');    // 正確轉成 boolean

        const body = {
            phone: (this.f['phone'].value as string).trim(),
            password: this.f['password'].value as string,
            name: (this.f['name'].value as string).trim(),
            email: (this.f['email'].value as string).trim(),
            gender: genderBool,                                // ← 用轉好的 boolean
            birthday: this.f['birthday'].value as string,              // yyyy-MM-dd
            address: (this.f['address'].value as string).trim(),

            // 後端其他欄位預設
            status: Number(this.f['status'].value) || 1,
            level: Number(this.f['level'].value) || 1,
            isAuthor: !!this.f['isAuthor'].value,
        };


        this.http.post(`${API_BASE}/users/register`, body, {
            headers: new HttpHeaders().set('Content-Type', 'application/json')
        }).subscribe({
            next: () => {
                this.okMsg = '註冊成功！將帶您前往登入頁…';
                setTimeout(() => this.router.navigateByUrl('/member/login'), 1200);
            },
            error: (err) => {
                if (err?.status === 409) this.error = (err.error || '手機或 Email 已存在');
                else this.error = err?.error || '註冊失敗';
                this.loading = false;
            },
            complete: () => this.loading = false
        });
    }
}
