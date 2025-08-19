import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forum-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forum-detail.component.html',
  styleUrls: ['./forum-detail.component.css']
})
export class ForumDetailComponent {
  private route = inject(ActivatedRoute);
  postId = this.route.snapshot.paramMap.get('id');

  post = {
    title: `文章 #${this.postId}`,
    author: 'Demo User',
    createdAt: '2025-08-18 09:30',
    content: `這是文章 #${this.postId} 的內容。
這裡可以放很多文字，模擬實際的討論串內容。`
  };
}
