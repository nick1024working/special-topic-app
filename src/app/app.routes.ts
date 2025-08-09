import { Routes } from '@angular/router';
import { ForumHomeComponent } from './features/forum/pages/forum-home/forum-home.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // 新增論壇首頁路由
  { path: 'forum', component: ForumHomeComponent },

  { path: '**', redirectTo: 'home' }
];
