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
export class ForumListComponent implements OnInit {
  categories: Category[] = [];
  posts: any[] = [];

  categoryId?: number;
  page = 1;               // ← 分頁：目前頁
  pageSize = 10;          // ← 分頁：每頁筆數

  constructor(private route: ActivatedRoute, private forum: ForumService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      const c = p.get('category');
      this.categoryId = c ? +c : undefined;

      // 換分類就回到第 1 頁
      this.page = 1;

      if (this.categoryId) {
        this.loadPosts(this.categoryId);
      } else {
        this.loadCategories();
      }
    });
  }

  private loadPosts(categoryId: number) {
    this.forum
      .getPostsByCategory(categoryId, this.page, this.pageSize)
      .subscribe(res => (this.posts = res));
  }

  private loadCategories() {
    this.forum.getCategories().subscribe(list => (this.categories = list));
  }

  // ===== 分頁控制 =====
  nextPage() {
    if (!this.categoryId) return;
    if (this.posts.length < this.pageSize) return; // 已經最後一頁
    this.page++;
    this.loadPosts(this.categoryId);
  }

  prevPage() {
    if (!this.categoryId) return;
    if (this.page === 1) return;
    this.page--;
    this.loadPosts(this.categoryId);
  }
}
