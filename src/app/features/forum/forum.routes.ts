import { Routes } from '@angular/router';
import { ForumHomeComponent } from './pages/forum-home/forum-home.component';
import { ForumListComponent } from './pages/forum-list/forum-list.component';
import { ForumDetailComponent } from './pages/forum-detail/forum-detail.component';

export const FORUM_ROUTES: Routes = [
  { path: '', component: ForumHomeComponent, title: '論壇首頁' },     // /forum
  { path: 'list', component: ForumListComponent, title: '文章列表' }, // /forum/list
  { path: ':id', component: ForumDetailComponent, title: '文章內容' },// /forum/123
  { path: '**', redirectTo: '' }
];
