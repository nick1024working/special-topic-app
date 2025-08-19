import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// ------ 簡單型別（之後可搬到 types.ts）------
interface Category {
  id: number;
  name: string;
}
interface ForumPost {
  postId: number;
  title: string;
  authorName: string;
  createdAt: string | Date;
  viewCount: number;
  likeCount: number;
  contentHtml: string;
  images?: string[];
}
interface ForumComment {
  commentId: number;
  authorName: string;
  createdAt: string | Date;
  content: string;
}

// 如果你已有 ForumService，可解除註解後使用
// import { ForumService } from '../../data/forum.service';

@Component({
  selector: 'app-forum-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './forum-detail.component.html'
})
export class ForumDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  // private forum = inject(ForumService);

  // ---- 這些是模板用到的屬性（補齊就不會報錯）----
  post: ForumPost | null = null;
  mainImage: string | undefined;
  images: string[] = [];
  comments: ForumComment[] = [];
  categories: Category[] = [];
  newComment = '';
// 建議放在 class 內最上方或方法區
static readonly FALLBACK_IMG = 'assets/forum-v4/images/avatar4.jpg';

// <img (error)="onImgError($event)">
onImgError(ev: Event): void {
  const img = ev.target as HTMLImageElement | null;
  if (!img) return;

  // 避免進入無限循環：只在不是 fallback 時才替換，並且移除 onerror
  if (!img.src.includes(ForumDetailComponent.FALLBACK_IMG)) {
    img.onerror = null;
    img.src = ForumDetailComponent.FALLBACK_IMG;
  }
}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPost(id);
    this.loadComments(id);
    this.loadCategories();
  }

  // ----------------- 假資料/占位：先讓版面正常 -----------------
  private loadPost(id: number) {
    // 之後可改成：this.forum.getPost(id).subscribe(p => { ... });
    const demo: ForumPost = {
      postId: id || 1,
      title: '示範文章標題',
      authorName: 'Loki',
      createdAt: new Date(),
      viewCount: 123,
      likeCount: 7,
      contentHtml: `<p>這是文章內容的 <strong>HTML</strong> 區塊。之後會由 API 回傳。</p>`,
      images: [
        'assets/forum-v4/img/main1.jpg',
        'assets/forum-v4/img/thumb1.jpg',
        'assets/forum-v4/img/thumb2.jpg',
        'assets/forum-v4/img/thumb3.jpg'
      ]
    };
    this.post = demo;
this.images = [
  'assets/forum-v4/images/main1.jpg',
  'assets/forum-v4/images/thumb1.jpg',
  'assets/forum-v4/images/thumb2.jpg',
  'assets/forum-v4/images/thumb3.jpg'
];
    this.mainImage = this.images[0];
  }

  private loadComments(postId: number) {
    // 之後可改成：this.forum.getComments(postId).subscribe(cs => this.comments = cs);
    this.comments = [
      { commentId: 1, authorName: 'Alice', createdAt: new Date(), content: '很實用的文章，感謝分享！' },
      { commentId: 2, authorName: 'Bob', createdAt: new Date(), content: '想請問一下圖片怎麼上傳？' }
    ];
  }

  private loadCategories() {
    // 之後可改成：this.forum.getCategories().subscribe(c => this.categories = c);
    this.categories = [
      { id: 1, name: '公告通知' },
      { id: 2, name: '新手提問' },
      { id: 3, name: '心得分享' },
      { id: 4, name: '站務管理' }
    ];
  }
// forum-detail.component.ts (class 內加上這段)
trackByIndex(index: number, _: unknown): number {
  return index;
}

  // ----------------- 事件 -----------------
  addComment() {
    if (!this.newComment.trim()) return;
    const newId = (this.comments.at(-1)?.commentId ?? 0) + 1;
    this.comments = [
      ...this.comments,
      { commentId: newId, authorName: '你', createdAt: new Date(), content: this.newComment.trim() }
    ];
    this.newComment = '';
  }
}
