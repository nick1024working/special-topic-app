import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumService, ForumPostVm, ForumComment } from '../../services/forum.service';

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
      // ★ 移除分類載入
    });
  }

  private loadPost(id: number) {
    this.forum.getPost(id).subscribe(vm => {
      this.post = vm;
const raw = vm.images ?? [];
this.images = raw.map((x: any) => typeof x === 'string' ? x : x.src);
      this.mainImage = this.images.length ? this.images[0] : undefined;
    });
  }

  private loadComments(id: number) {
    this.forum.getComments(id).subscribe(list => {
      this.comments = list ?? [];
    });
  }

  // ====== 編輯/刪除 ======
  goEdit() {
    if (!this.post) return;
    this.router.navigate(['/forum/edit', this.post.postId]);
  }

confirmDelete() {
  if (!this.post) return;
  if (!confirm('確定要刪除這篇文章嗎？')) return;

  const boardId = this.post.boardId; // 先存起來，避免刪掉後 post 為空

  this.forum.deletePost(this.post.postId).subscribe({
    next: () => {
      // 與麵包屑用法一致：使用「矩陣參數」帶分類
      // （你的 breadcrumb 也是這樣連到分類：['/forum/list', { category: post.boardId }]）:contentReference[oaicite:1]{index=1}
      if (boardId) {
        this.router.navigate(['/forum/list', { category: boardId }]);
        // 若你偏好 query string，也可用：
        // this.router.navigate(['/forum/list'], { queryParams: { category: boardId }});
      } else {
        this.router.navigate(['/forum/list']);
      }
    },
    error: (err) => {
      console.error(err);
      alert('刪除失敗，請稍後再試');
    }
  });
}
// ====== 按讚 ======
isLiking = false;

likePost() {
  if (!this.post || this.isLiking || this.post.likedByMe) return;
  this.isLiking = true;

  // 樂觀：先 +1，再以伺服器值覆蓋
  const prev = this.post.likeCount;
  this.post.likeCount = prev + 1;

  this.forum.likePost(this.post.postId).subscribe({
    next: (res) => {
      this.post!.likedByMe = !!res?.liked;
      if (typeof res?.likeCount === 'number') this.post!.likeCount = res.likeCount;
      this.isLiking = false;
    },
    error: (err) => {
      console.error('[likePost] failed:', err);
      this.post!.likeCount = prev;
      this.isLiking = false;
      alert('按讚失敗，請稍後再試');
    }
  });
}

  // ====== 新增留言（樂觀 → 以後端回應覆蓋） ======
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

    // 呼叫後端，成功後覆蓋暫存留言
    this.forum.addComment(this.post.postId, content).subscribe({
      next: (real) => {
        this.comments = this.comments.map(c => c.commentId === tempId ? real : c);
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
