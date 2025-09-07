import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, Validators, ReactiveFormsModule,
  FormGroup, FormControl
} from '@angular/forms';
import { MemberService } from '../member.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  // 類型（Typed Forms）
  form!: FormGroup<{ accountOrEmail: FormControl<string> }>;

  sending = false;
  done = false;
  error = '';

  constructor(private fb: FormBuilder, private api: MemberService) {
    //  在 constructor 內初始化，不會有「未賦值就使用」的問題
    this.form = this.fb.nonNullable.group({
      accountOrEmail: this.fb.nonNullable.control('', Validators.required),
    });
  }

  submit() {
    this.error = '';
    if (this.form.invalid) return;
    this.sending = true;

    const accountOrEmail = this.form.controls.accountOrEmail.value;

    this.api.forgotPassword(accountOrEmail)
      .subscribe({
        next: () => { this.done = true; },
        error: (e) => { this.error = e?.error ?? '發送失敗'; },
      })
      .add(() => this.sending = false);
  }
}
