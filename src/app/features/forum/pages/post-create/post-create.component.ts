import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type Preview = { file: File; url: string };

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-create.component.html',
})
export class PostCreateComponent {
  form: FormGroup;
  previews: Preview[] = [];         // 圖片預覽清單（含 File 與 object URL）

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      postCategoryID: [null, Validators.required],
      postFilterID: [null, Validators.required],
      contentHtml: ['', Validators.required],
      mainIndex: [null],            // ⭐ 主圖索引（null = 不設定主圖）
    });
  }

  // 讓樣板好寫：form.controls.xxx
  get f() { return this.form.controls; }

  onFilesSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // 釋放舊的 objectURL，避免記憶體累積
    this.previews.forEach(p => URL.revokeObjectURL(p.url));

    const files = Array.from(input.files);
    this.previews = files.map(file => ({ file, url: URL.createObjectURL(file) }));

    // 如果目前 mainIndex 超出範圍，重置
    const cur = this.form.value.mainIndex as number | null;
    if (typeof cur === 'number' && (cur < 0 || cur >= this.previews.length)) {
      this.form.patchValue({ mainIndex: null });
    }
  }

  removeImage(i: number) {
    // 釋放被刪除的 objectURL
    const removed = this.previews[i];
    if (removed) URL.revokeObjectURL(removed.url);

    this.previews.splice(i, 1);

    // 同步調整 mainIndex
    const cur = this.form.value.mainIndex as number | null;
    if (cur === i) this.form.patchValue({ mainIndex: null });
    else if (typeof cur === 'number' && cur > i) this.form.patchValue({ mainIndex: cur - 1 });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 組 payload
    const { title, postCategoryID, postFilterID, contentHtml, mainIndex } = this.form.value as {
      title: string; postCategoryID: number; postFilterID: number; contentHtml: string; mainIndex: number | null;
    };

    // 範例：FormData（含多檔上傳與主圖索引）
    const fd = new FormData();
    fd.append('title', title);
    fd.append('postCategoryID', String(postCategoryID ?? ''));
    fd.append('postFilterID', String(postFilterID ?? ''));
    fd.append('contentHtml', contentHtml);
    fd.append('mainIndex', mainIndex === null ? '' : String(mainIndex));
    this.previews.forEach((p, idx) => fd.append('images', p.file, p.file.name || `image_${idx}.jpg`));

    // TODO: 呼叫你的 API，例如：
    // this.http.post('/api/forum/posts', fd).subscribe(() => this.router.navigate(['/forum/list']));

    console.log('[DEBUG] submit payload', { title, postCategoryID, postFilterID, contentHtml, mainIndex, files: this.previews.length });
    alert('表單已準備好送出（目前示範用 console / alert）。');
  }

  // 離開頁面時把 objectURL 清掉
  ngOnDestroy() {
    this.previews.forEach(p => URL.revokeObjectURL(p.url));
  }
}
