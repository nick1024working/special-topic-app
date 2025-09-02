import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

type Preview = { file: File; url: string };
type OptionItem = { id: number; name: string };

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-create.component.html',
})
export class PostCreateComponent {
  form: FormGroup;
  previews: Preview[] = [];
  categories: OptionItem[] = [];
  submitting = false;
  errorMsg = '';

  // TODO: 改成 environment.apiBaseUrl（此處先沿用你原本設定）
  private baseUrl = 'https://localhost:7104';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      postCategoryID: [null, Validators.required],
      contentHtml: ['', Validators.required],
      mainIndex: [null], // 主圖索引（null 表示不設定主圖）
    });
  }

  ngOnInit() {
    this.http.get<OptionItem[]>(`${this.baseUrl}/api/forum/categories`).subscribe({
      next: (data) => (this.categories = data),
      error: () => (this.categories = []),
    });
  }

  get f() { return this.form.controls; }

  onFilesSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // 釋放舊的預覽 URL，避免記憶體洩漏
    this.previews.forEach(p => URL.revokeObjectURL(p.url));

    const files = Array.from(input.files);
    this.previews = files.map(file => ({ file, url: URL.createObjectURL(file) }));

    // 如果原本選的主圖索引超出範圍，重置
    const cur = this.form.value.mainIndex as number | null;
    if (typeof cur === 'number' && (cur < 0 || cur >= this.previews.length)) {
      this.form.patchValue({ mainIndex: null });
    }
  }

  removeImage(i: number) {
    const removed = this.previews[i];
    if (removed) URL.revokeObjectURL(removed.url);
    this.previews.splice(i, 1);

    const cur = this.form.value.mainIndex as number | null;
    if (cur === i) this.form.patchValue({ mainIndex: null });
    else if (typeof cur === 'number' && cur > i) this.form.patchValue({ mainIndex: cur - 1 });
  }

  submit() {
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = '請確認標題、分類、內容都已填寫。';
      return;
    }

    const { title, postCategoryID, contentHtml, mainIndex } = this.form.value as {
      title: string; postCategoryID: number; contentHtml: string; mainIndex: number | null;
    };

    const fd = new FormData();
    fd.append('title', title);
    fd.append('postCategoryID', String(postCategoryID ?? ''));
    fd.append('contentHtml', contentHtml);
    fd.append('mainIndex', mainIndex === null ? '' : String(mainIndex));

    // 關鍵：與 HTML input 的 name 對齊（images）
    this.previews.forEach((p, idx) =>
      fd.append('images', p.file, p.file.name || `image_${idx}.jpg`)
    );

    this.submitting = true;

    this.http.post<{ postId: number }>(`${this.baseUrl}/api/forum/posts`, fd).subscribe({
      next: (res) => {
        alert('已成功建立文章！');
        // 成功後導到該分類列表，或轉到詳細頁
        if (postCategoryID) {
          this.router.navigate(['/forum/list', { category: postCategoryID }]);
        } else {
          this.router.navigate(['/forum/list']);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        // 顯示後端回傳的錯誤資訊
        if (err.error?.title || err.error?.detail) {
          this.errorMsg = `${err.error.title || '建立文章失敗'}：${err.error.detail || ''}`.trim();
        } else if (typeof err.error === 'string') {
          this.errorMsg = err.error;
        } else {
          this.errorMsg = '建立文章失敗，請稍後再試或檢查後端日誌。';
        }
        alert(this.errorMsg);
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }

  ngOnDestroy() {
    this.previews.forEach(p => URL.revokeObjectURL(p.url));
  }
}
