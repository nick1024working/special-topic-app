import { Routes } from '@angular/router';
import { ForumHomeComponent } from './pages/forum-home/forum-home.component';

export const FORUM_ROUTES: Routes = [
      { path: '', redirectTo: 'forum', pathMatch: 'full' },

  // 新增論壇首頁路由
  { path: '', component: ForumHomeComponent },

  { path: '**', redirectTo: '' }
];
