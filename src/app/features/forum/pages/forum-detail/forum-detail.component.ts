import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ForumService, ForumPostVm, ForumComment, Category } from '../../services/forum.service';
import { switchMap, filter } from 'rxjs';

@Component({
  selector: 'app-forum-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './forum-detail.component.html'
})
export class ForumDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private forum: ForumService = inject(ForumService);

  post: ForumPostVm | null = null;
  images: string[] = [];
  mainImage?: string;
  comments: ForumComment[] = [];
  categories: Category[] = [];
  newComment = '';

  static readonly FALLBACK_IMG = 'assets/forum-v4/images/avatar4.jpg';

  ngOnInit(): void {
    // 1) 路由參數改用 paramMap（避免重用元件時沒更新）
    this.route.paramMap.pipe(
      map => map // 只是讓 TS 別報錯（tooling quirk）
    );
    this.route.paramMap
      .pipe(
        filter(p => !!p.get('id')),
        switchMap(p => this.forum.getPost(Number(p.get('id'))))
      )
      .subscribe((p: ForumPostVm) => {
        this.post = p;
        this.images = p.images || [];
        this.mainImage = this.images[0];
      });

    // 2) 其餘資料
    const id = Number(this.route.snapshot.paramMap.get('id') || 0);
    if (id) {
      this.forum.getComments(id).subscribe((cs: ForumComment[]) => this.comments = cs);
    }
    this.forum.getCategories().subscribe((c: Category[]) => this.categories = c);
  }

  addComment() {
    if (!this.newComment.trim()) return;
    const now = new Date().toISOString();
    const comment: ForumComment = {
      commentId: (this.comments.at(-1)?.commentId ?? 0) + 1,
      authorName: '你',
      createdAt: now,
      content: this.newComment.trim()
    };
    this.comments = [...this.comments, comment];
    this.newComment = '';
  }

  onImgError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    if (!img.src.includes(ForumDetailComponent.FALLBACK_IMG)) {
      img.onerror = null;
      img.src = ForumDetailComponent.FALLBACK_IMG;
    }
  }

  trackByIndex(i: number) { return i; }
}
