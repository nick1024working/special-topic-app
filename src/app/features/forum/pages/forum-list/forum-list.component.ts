import { ActivatedRoute } from '@angular/router';
import { ForumService, Category } from '../../services/forum.service';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core'; // ← 多帶 ViewEncapsulation

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './forum-list.component.html',
  styleUrls: ['./forum-list.component.css'],          // ← 掛上這支
  // 可先暫時取消封裝來排除干擾（看到套用後可拿掉這行）
  encapsulation: ViewEncapsulation.None
})
export class ForumListComponent implements OnInit {
  categories: Category[] = [];
  posts: any[] = [];
  categoryId?: number;

  constructor(private route: ActivatedRoute, private forum: ForumService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      const c = p.get('category');     // 你目前的路由是 matrix param 或 path param 都行
      this.categoryId = c ? +c : undefined;

      if (this.categoryId) {
        // 這裡維持你原本載「文章列表」的程式
        // this.loadPosts(this.categoryId);
      } else {
        this.loadCategories();
      }
    });
  }

  private loadCategories() {
    this.forum.getCategories().subscribe(list => (this.categories = list));
  }
}
