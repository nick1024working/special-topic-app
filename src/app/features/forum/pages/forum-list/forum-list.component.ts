import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink /*, RouterLinkActive*/ } from '@angular/router'; // ★ 新增
import { finalize } from 'rxjs';
import { ForumService } from '../../services/forum.service'; // 依你的實際路徑

export interface PostListItem {
  postId: number;
  title: string | null;
  boardId: number;
  boardName: string;
  authorName: string;
  createdAt: string | Date | null;
  viewCount: number | null;
  likeCount: number;
  replyCount: number;
  excerpt: string;
}

export interface CategoryListItem {
  id: number;
  name: string;
  postCount?: number;
  lastPostAt?: string | Date | null;
}

export interface PostListResponse {
  items: PostListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

@Component({
  selector: 'app-forum-list',
  standalone: true,                                    // ★ 確定有 standalone: true
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    RouterLink,                                        // ★ 新增
    // RouterLinkActive,                               // 需要 active 樣式時可加
  ],
  templateUrl: './forum-list.component.html',
  styleUrls: ['./forum-list.component.css']
})
export class ForumListComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private forum = inject(ForumService);

  // 分頁 / 狀態
  page = 1;
  pageSize = 10;
  loading = false;

  // 排序鍵（與後端一致）
  sort: 'new' | 'hot' | 'view' = 'new';

  // UI 資料
  categoryId: number | null = null;
  categories: CategoryListItem[] = [];
  posts: PostListItem[] = [];
  totalCount: number | undefined;

  // 骨架列
  skeletonRows = Array.from({ length: 6 });

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const categoryParam = pm.get('category');
      this.categoryId = categoryParam ? Number(categoryParam) : null;

      if (this.categoryId) {
        this.page = 1; // 進入分類頁面預設回到第 1 頁
        this.loadPosts(this.categoryId);
      } else {
        this.loadCategories();
      }
    });
  }

  // 切換排序
  setSort(s: 'new' | 'hot' | 'view') {
    if (this.sort === s) return;
    this.sort = s;
    if (this.categoryId) {
      this.page = 1;
      this.loadPosts(this.categoryId);
    }
  }

  // 分頁
  nextPage() {
    if (!this.categoryId) return;
    this.page++;
    this.loadPosts(this.categoryId);
  }
  prevPage() {
    if (!this.categoryId || this.page === 1) return;
    this.page--;
    this.loadPosts(this.categoryId);
  }

  // 讀取「主題列表」(分類列表)
  private loadCategories() {
    this.loading = true;
    this.forum.getCategories()
      .pipe(finalize(() => this.loading = false))
      .subscribe((res: CategoryListItem[]) => {
        this.categories = res ?? [];
      });
  }

  // 讀取「文章列表」（依分類）
private loadPosts(categoryId: number) {
  this.loading = true;

  // 刪掉這兩行（或整個 orderKey 變數）
  // const orderKey = this.sort as unknown as ('latest'|'hot'|'viewed'|undefined);

  // 直接傳 this.sort（型別：'new'|'hot'|'view'）
  this.forum.getPostsByCategory(categoryId, this.page, this.pageSize, this.sort)
    .pipe(finalize(() => this.loading = false))
    .subscribe((res: any | PostListResponse) => {
      if (Array.isArray(res)) {
        this.posts = res ?? [];
        this.totalCount = undefined;
      } else {
        this.posts = res?.items ?? [];
        this.totalCount = res?.total ?? this.posts.length;
      }
    });
  }
}
