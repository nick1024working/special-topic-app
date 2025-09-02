import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumService, ForumPostVm, ForumComment, Category } from '../../services/forum.service';

@Component({
  selector: 'app-forum-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, RouterLink, DatePipe],
  templateUrl: './forum-detail.component.html',
  styleUrls: ['./forum-detail.component.css'],
  // 讓樣式能覆蓋套版舊 CSS
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
    private forum: ForumService
  ) {}

  ngOnInit(): void {
    // 從路由抓文章 id（/forum/detail/:id）
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

  addComment() {
    const content = this.newComment?.trim();
    if (!content || !this.post) return;

    // 前端先樂觀新增一筆
    const nowIso = new Date().toISOString();
    this.comments.push({
      commentId: Math.max(0, ...this.comments.map(x => x.commentId || 0)) + 1,
      authorName: '我',
      createdAt: nowIso,
      content
    });

    this.newComment = '';
    // ★ 若後端有新增留言 API，可在這裡呼叫並同步最新清單
  }

  onImgError(ev: Event) {
    const el = ev.target as HTMLImageElement;
    if (el && el.src !== this.placeholder) {
      el.src = this.placeholder;
    }
  }

  trackByIndex = (_: number, __: unknown) => _;
}
