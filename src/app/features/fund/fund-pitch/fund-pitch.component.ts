import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-fund-pitch',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './fund-pitch.component.html',
    styleUrl: './fund-pitch.component.css'
})
export class FundPitchComponent {
    form: FormGroup;

    // 類別（可改成從 API 取得）
    categories = [
        { id: 1, name: '商業理財' },
        { id: 2, name: '人文社會' },
        { id: 3, name: '圖文漫畫' },
        { id: 4, name: '醫療保健' },
        { id: 4, name: '影視偶像' },
        { id: 4, name: '生活風格' },
    ];

    // 封面預覽
    coverPreview = signal<string | null>(null);
    coverFile: File | null = null;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            Name: ['', [Validators.required, Validators.maxLength(50)]],          // 真實身分/名稱
            Email: ['', [Validators.required, Validators.email]],                      // 電子信箱
            startDate: ['', Validators.required],                                      // 預計開始時間
            endDate: ['', Validators.required],                                        // 預計結束時間
            categoryId: [null, Validators.required],                                   // 分類
            targetAmount: [null, [Validators.required, Validators.min(1)]],            // 目標金額
            shortDescription: ['', [Validators.required, Validators.maxLength(200)]],  // 計畫簡介
            longDescription: ['', [Validators.required, Validators.minLength(20)]],    // 計畫說明
            coverImage: [null]                                                         // 封面照片（檔案）
        });
    }

    onCoverSelected(e: Event) {
        const input = e.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];
        this.coverFile = file;
        const reader = new FileReader();
        reader.onload = () => this.coverPreview.set(reader.result as string);
        reader.readAsDataURL(file);
        this.form.patchValue({ coverImage: file });
    }

    /** 基本檢查：結束日需 >= 開始日 */
    dateRangeInvalid(): boolean {
        const s = this.form.value.startDate ? new Date(this.form.value.startDate) : null;
        const e = this.form.value.endDate ? new Date(this.form.value.endDate) : null;
        if (!s || !e) return false;
        return e.getTime() < s.getTime();
    }

    submit() {
        if (this.form.invalid || this.dateRangeInvalid()) {
            this.form.markAllAsTouched();
            return;
        }

        // 這裡先示範：組成 FormData（未串 API 前先 console）
        const fd = new FormData();
        Object.entries(this.form.value).forEach(([key, val]) => {
            if (key === 'coverImage' && this.coverFile) {
                fd.append('coverImage', this.coverFile);
            } else {
                fd.append(key, String(val ?? ''));
            }
        });

        // TODO: 呼叫 WebAPI /api/pitches (POST)
        // this.http.post('/api/pitches', fd).subscribe(...)

        alert('提案送出成功！（目前為示範，尚未串接 API）');
        this.form.reset();
        this.coverPreview.set(null);
        this.coverFile = null;
    }

    // 快速存取驗證
    hasError(name: string, type: string) {
        const c = this.form.get(name);
        return !!c && c.touched && c.hasError(type);
    }
}
