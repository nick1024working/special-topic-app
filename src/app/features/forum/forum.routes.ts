import { Routes } from '@angular/router';
import { ForumDetailComponent } from './pages/forum-detail/forum-detail.component';
import { ForumListComponent } from './pages/forum-list/forum-list.component';
import { ForumHomeComponent } from './pages/forum-home/forum-home.component';
import { PostCreateComponent } from './pages/post-create/post-create.component';

export const FORUM_ROUTES: Routes = [
  { path: '', component: ForumHomeComponent, title: '論壇首頁' },
  { path: 'list', component: ForumListComponent, title: '文章列表' },
  { path: 'new', component: PostCreateComponent, title: '發表文章' },
  { path: 'create', component: PostCreateComponent, title: '發表文章' },   // ⬅️ 新增
  { path: ':id', component: ForumDetailComponent, title: '文章內容' },
  { path: 'posts/:id', component: ForumDetailComponent, title: '文章內容' },
  { path: '**', redirectTo: '' }
];
