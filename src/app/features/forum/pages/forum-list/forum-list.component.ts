import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './forum-list.component.html',
  styleUrls: ['./forum-list.component.css']
})
export class ForumListComponent {
  posts = [
    { postId: 1, title: '第一篇文章', author: 'Alice', createdAt: '2025-08-18 09:30' },
    { postId: 2, title: '第二篇文章', author: 'Bob', createdAt: '2025-08-17 14:05' },
    { postId: 3, title: '第三篇文章', author: 'Carol', createdAt: '2025-08-16 20:10' },
  ];
}
