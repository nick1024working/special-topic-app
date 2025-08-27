import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { ForumService, Category } from '../../services/forum.service';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, DatePipe],
  templateUrl: './forum-list.component.html',
  styleUrls: ['./forum-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
// forum-list.component.ts（重要片段）
export class ForumListComponent implements OnInit {
  categories: Category[] = [];
  posts: any[] = [];
  categoryId?: number;

  // 分頁狀態
  page = 1;
  pageSize = 20;

  constructor(private route: ActivatedRoute, private forum: ForumService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      const c = p.get('category');
      this.categoryId = c ? +c : undefined;

      if (this.categoryId) {
        this.page = 1; // 切換版塊時回到第1頁
        this.loadPosts(this.categoryId);
      } else {
        this.loadCategories();
      }
    });
  }

  private loadCategories() {
    this.forum.getCategories().subscribe(list => (this.categories = list));
  }

  private loadPosts(categoryId: number) {
    this.forum.getPostsByCategory(categoryId, this.page, this.pageSize)
      .subscribe(list => this.posts = list);
  }

  // ===== 分頁控制 =====

  // 分頁事件
  nextPage() {
    if (this.posts.length < this.pageSize) return;
    this.page++;
    if (this.categoryId) this.loadPosts(this.categoryId);
  }
  prevPage() {
    if (this.page === 1) return;
    this.page--;
    if (this.categoryId) this.loadPosts(this.categoryId);
  }
}
