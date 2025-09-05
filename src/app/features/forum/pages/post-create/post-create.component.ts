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

  // 新增：編輯時既有圖片（Base64 data URLs）
existingImages: { imageId: number; src: string }[] = [];
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
  this.forum.getCategories().subscribe(cs => {
    this.categories = cs ?? [];
    const catParam = this.route.snapshot.paramMap.get('category')
                 ?? this.route.snapshot.queryParamMap.get('category');
    const catId = catParam ? Number(catParam) : null;
    if (catId) this.form.patchValue({ postCategoryID: catId });
  });

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
  this.forum.getPost(id).subscribe((vm: any) => {
    this.form.patchValue({
      title: vm.title ?? '',
      contentHtml: vm.contentHtml ?? '',
      postCategoryID: vm.postCategoryID ?? vm.boardId ?? null,
    });

    // ★ 假設 vm.images 變成 [{imageId, src}]
    this.existingImages = (vm as any).images ?? [];
  });
}
removeExistingImage(imageId: number) {
  if (!this.postId) return;
  if (!confirm('確定要刪除這張圖片嗎？')) return;

  this.forum.deletePostImage(this.postId, imageId).subscribe({
    next: () => {
      this.existingImages = this.existingImages.filter(i => i.imageId !== imageId);
    },
    error: (err) => {
      console.error('[deletePostImage] failed:', err);
      alert('刪除圖片失敗，請稍後再試');
    }
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
      // 若有新增圖片，再呼叫 /posts/{id}/images
      if (this.files.length > 0) {
        const imgFd = new FormData();
        this.files.forEach((f) => imgFd.append('files', f, f.name));
        imgFd.append('mainIndex', '0'); // 需要主圖時可調整

        this.forum.uploadPostImages(this.postId!, imgFd).subscribe({
          next: () => {
            alert('已更新（含新圖片）');
            this.files = []; // 清空選取
            this.router.navigate(['/forum', this.postId]);
          },
          error: (err) => {
            console.error('[uploadPostImages] failed:', err);
            alert('圖片上傳失敗，請稍後再試');
            this.submitting = false;
          }
        });
      } else {
        alert('已更新');
        this.router.navigate(['/forum', this.postId]);
      }
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
this.files.forEach((f, i) => fd.append('files', f, f.name));
fd.append('mainIndex', '0'); // 預設第一張為主圖

this.forum.createPost(fd).subscribe({
  next: (res) => {
    alert('已發表');
    const idToGo = res?.postId;
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
