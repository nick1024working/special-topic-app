import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors, ValidatorFn,
  FormGroup, FormControl
} from '@angular/forms';
import { MemberService } from '../member.service';

//  型別正確的自訂驗證器
const strongPwd: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v: string = (c.value ?? '').toString();
  if (v.length < 8 || !/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return { weak: true };
  return null;
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  loading = true;
  valid = false;
  error = '';
  saving = false;
  ok = false;
  countdown = 3;

  //  先宣告型別，稍後在 constructor 內初始化
  form!: FormGroup<{
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private api: MemberService,
  ) {
    //  在 constructor 裡初始化，不會有「fb 尚未賦值」問題
    this.form = this.fb.nonNullable.group({
      newPassword: this.fb.nonNullable.control('', [Validators.required, strongPwd]),
      confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) { this.error = '缺少 token'; this.loading = false; return; }

    this.api.validateResetToken(this.token).subscribe({
      next: () => { this.valid = true; },
      error: () => { this.error = '連結無效或已過期'; },
    }).add(() => this.loading = false);
  }

  submit() {
    this.error = '';
    if (this.form.invalid) return;

    //  取得強型別的值
    const { newPassword, confirmPassword } = this.form.getRawValue();

    if (newPassword !== confirmPassword) {
      this.error = '兩次密碼不一致';
      return;
    }

    this.saving = true;
    this.api.resetPassword(this.token, newPassword, confirmPassword).subscribe({
      next: () => {
        this.ok = true;
        const t = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) { clearInterval(t); this.router.navigateByUrl('/member/login'); }
        }, 1000);
      },
      error: (e) => this.error = e?.error ?? '重設失敗',
    }).add(() => this.saving = false);
  }
}
