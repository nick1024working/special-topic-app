import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumService, ForumPostVm, ForumComment, Category } from '../../services/forum.service';

@Component({
  selector: 'app-forum-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, RouterLink, DatePipe],
  templateUrl: './forum-detail.component.html',
  styleUrls: ['./forum-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ForumDetailComponent implements OnInit {
  post?: ForumPostVm;
  images: string[] = [];
  mainImage?: string;

  comments: ForumComment[] = [];
  categories: Category[] = [];
  newComment = '';

  private placeholder = 'assets/forum-v4/images/noimage.png';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private forum: ForumService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      const id = Number(p.get('id'));
      if (!id) return;

      this.loadPost(id);
      this.loadComments(id);
      this.loadCategories();
    });
  }

  private loadPost(id: number) {
    this.forum.getPost(id).subscribe(vm => {
      this.post = vm;
      this.images = vm.images ?? [];
      this.mainImage = this.images.length ? this.images[0] : undefined;
    });
  }

  private loadComments(id: number) {
    this.forum.getComments(id).subscribe(list => {
      this.comments = list ?? [];
    });
  }

  private loadCategories() {
    this.forum.getCategories().subscribe(list => this.categories = list);
  }

  // ====== 編輯/刪除 ======
  goEdit() {
    if (!this.post) return;
    this.router.navigate(['/forum/edit', this.post.postId]);
  }

  confirmDelete() {
    if (!this.post) return;
    if (!confirm('確定要刪除這篇文章嗎？')) return;

    this.forum.deletePost(this.post.postId).subscribe({
      next: () => {
        alert('已刪除');
        this.router.navigate(['/forum/list']);
      },
      error: (err) => {
        console.error(err);
        alert('刪除失敗，請稍後再試');
      }
    });
  }

  // ====== 新增留言（先做樂觀更新；若後端失敗則回滾） ======
  addComment() {
    const content = this.newComment?.trim();
    if (!content || !this.post) return;

    // 樂觀更新
    const tempId = Math.max(0, ...this.comments.map(x => x.commentId || 0)) + 1;
    const tempComment: ForumComment = {
      commentId: tempId,
      authorName: '我',
      createdAt: new Date().toISOString(),
      content
    };
    this.comments = [tempComment, ...this.comments];
    this.newComment = '';

    // 呼叫後端
    this.forum.addComment(this.post.postId, content).subscribe({
      next: (_res) => {
        // 若後端回傳真正的 id/time，可在此替換 tempComment
        // 這裡先略過，保持清爽
      },
      error: (err) => {
        console.error('[addComment] failed:', err);
        // 回滾
        this.comments = this.comments.filter(c => c.commentId !== tempId);
        alert('留言失敗，請稍後再試');
      }
    });
  }

  onImgError(ev: Event) {
    const el = ev.target as HTMLImageElement;
    if (el && el.src !== this.placeholder) el.src = this.placeholder;
  }

  trackByIndex = (_: number, __: unknown) => _;
}
