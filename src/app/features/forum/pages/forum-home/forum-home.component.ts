import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ForumService, ForumListItem, PagedResult } from '../../services/forum.service';

@Component({
  selector: 'app-forum-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, NgFor, DatePipe],
  templateUrl: './forum-home.component.html',
})
export class ForumHomeComponent implements OnInit {
  // 列表資料
  result?: PagedResult<ForumListItem>;
  items: ForumListItem[] = [];

  // 查詢參數
  page = 1;
  pageSize = 10;
  boardId?: number;
  orderBy = 'new';

  loading = false;

  constructor(private route: ActivatedRoute, private router: Router, private forum: ForumService) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(q => {
      this.page = +(q.get('page') ?? 1);
      this.pageSize = +(q.get('pageSize') ?? 10);
      this.boardId = q.has('boardId') ? +(q.get('boardId')!) : undefined;
      this.orderBy = q.get('orderBy') ?? 'new';

      this.fetch();
    });
  }

  fetch() {
    this.loading = true;
    this.forum.getPostList({ page: this.page, pageSize: this.pageSize, boardId: this.boardId, orderBy: this.orderBy })
      .subscribe(res => {
        this.result = res;
        this.items = res.items;
        this.loading = false;
      });
  }

  goPage(p: number) {
    if (!this.result) return;
    const target = Math.min(Math.max(1, p), this.result.totalPages);
    this.router.navigate([], {
      queryParams: { page: target, pageSize: this.pageSize, boardId: this.boardId, orderBy: this.orderBy },
      queryParamsHandling: 'merge'
    });
  }

  pages(): number[] {
    if (!this.result) return [1];
    const total = this.result.totalPages;
    const cur = this.result.page;
    const start = Math.max(1, cur - 2);
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
