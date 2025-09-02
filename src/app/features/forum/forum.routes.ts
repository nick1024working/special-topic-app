import { Routes } from '@angular/router';
import { ForumDetailComponent } from './pages/forum-detail/forum-detail.component';
import { ForumListComponent } from './pages/forum-list/forum-list.component';
import { ForumHomeComponent } from './pages/forum-home/forum-home.component';
import { PostCreateComponent } from './pages/post-create/post-create.component';

export const FORUM_ROUTES: Routes = [
  { path: '', component: ForumHomeComponent, title: '論壇首頁' },
  { path: 'list', component: ForumListComponent, title: '文章列表' },
  { path: 'new', component: PostCreateComponent, title: '發表文章' },
  { path: 'create', component: PostCreateComponent, title: '發表文章' },
  { path: 'edit/:id', component: PostCreateComponent, title: '編輯文章' },
  // 單篇文章（只保留一條主要路由即可，避免與其他 path 重疊困擾）
  { path: ':id', component: ForumDetailComponent, title: '文章內容' },
  { path: 'posts/:id', component: ForumDetailComponent, title: '文章內容' },
  { path: '**', redirectTo: '' }
];
