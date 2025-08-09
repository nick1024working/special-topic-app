import { Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';

export const EBOOK_ROUTES: Routes = [
    // { path: '', component: your-component },
    // [新增] 加入以下這條規則
    // 這條規則的意思是：當使用者導覽到 /ebook 這個路徑時
    // (因為後續路徑是空的，所以匹配 path: '')，
    // 預設要顯示的元件就是 BookListComponent。
    { path: '', component: BookListComponent },

    // 未來您可以繼續在這裡擴充 ebook 功能的其他路由
    // 例如：{ path: 'new', component: CreateBookComponent },
    //      { path: ':id', component: BookDetailComponent },
];
