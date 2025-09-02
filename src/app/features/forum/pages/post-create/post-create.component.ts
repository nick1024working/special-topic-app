import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ForumService, Category } from '../../services/forum.service';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-create.component.html',
  encapsulation: ViewEncapsulation.None
})
export class PostCreateComponent implements OnInit {
  form!: FormGroup;
  categories: Category[] = [];
  isEdit = false;
  postId?: number;

  // 上傳圖片（可多張）
  files: File[] = [];

  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private forum: ForumService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      postCategoryID: [null, [Validators.required]],
      contentHtml: ['', [Validators.required, Validators.minLength(3)]],
    });

    // 載入分類
    this.forum.getCategories().subscribe(cs => this.categories = cs ?? []);

    // 判斷是否為編輯模式
    this.route.paramMap.subscribe(p => {
      const id = Number(p.get('id'));
      if (id) {
        this.isEdit = true;
        this.postId = id;
        this.loadForEdit(id);
      }
    });
  }

  private loadForEdit(id: number) {
    this.forum.getPost(id).subscribe(vm => {
      // 後端未回傳分類時，保留 null；否則填入
      this.form.patchValue({
        title: vm.title ?? '',
        contentHtml: vm.contentHtml ?? '',
        // 你若後端回傳 Board/Category，請在這裡塞給 postCategoryID
      });
    });
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    // 收集多張
    for (let i = 0; i < input.files.length; i++) {
      this.files.push(input.files[i]);
    }
    // 清空 input，避免同檔名無法再次觸發 change
    input.value = '';
  }

  removeFile(idx: number) {
    this.files.splice(idx, 1);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;

    const { title, postCategoryID, contentHtml } = this.form.value;

    // 編輯
    if (this.isEdit && this.postId) {
      this.forum.updatePost(this.postId, { title, contentHtml, postCategoryID }).subscribe({
        next: () => {
          alert('已更新');
          this.router.navigate(['/forum', this.postId]);
        },
        error: (err) => {
          console.error('[updatePost] failed:', err);
          alert('更新失敗，請稍後再試');
          this.submitting = false;
        }
      });
      return;
    }

    // 新增：組 FormData 以支援圖片
    const fd = new FormData();
    fd.append('title', title);
    fd.append('contentHtml', contentHtml);
    if (postCategoryID != null) fd.append('postCategoryID', String(postCategoryID));
    // 附加多張圖（後端若要求固定欄位名請調整）
    this.files.forEach((f, i) => fd.append('images', f, f.name));

    this.forum.createPost(fd).subscribe({
      next: (newId) => {
        alert('已發表');
        const idToGo = Number(newId) || undefined;
        this.router.navigate(idToGo ? ['/forum', idToGo] : ['/forum/list']);
      },
      error: (err) => {
        console.error('[createPost] failed:', err);
        alert('發表失敗，請稍後再試');
        this.submitting = false;
      }
    });
  }
}
