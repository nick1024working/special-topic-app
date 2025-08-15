import { Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { CartPageComponent } from './cart-page/cart-page.component';
import { LibraryPageComponent } from './library-page/library-page.component';
// [新增] 匯入您先前建立的兩個新元件
import { RankingPageComponent } from './ranking-page/ranking-page.component';
import { EbookReaderComponent } from './ebook-reader/ebook-reader.component';
//import { NewArrivalsPageComponent } from '../new-arrivals-page/new-arrivals-page.component'; // 請確認 NewArrivalsPageComponent 的實際路徑


export const EBOOK_ROUTES: Routes = [
    // { path: '', component: your-component },
    // [新增] 加入以下這條規則
    // 這條規則的意思是：當使用者導覽到 /ebook 這個路徑時
    // (因為後續路徑是空的，所以匹配 path: '')，
    // 預設要顯示的元件就是 BookListComponent。
    { path: '', component: BookListComponent },
    // 當路徑是 /ebook/cart 時，顯示購物車頁面
    { path: 'cart', component: CartPageComponent },

    // 當路徑是 /ebook/library 時，顯示「我的書櫃」頁面
    { path: 'library', component: LibraryPageComponent },

    // [新增] 加入排行榜和新品的路由規則
    // 將它們放在 :id 之前，以避免 'ranking' 被誤認為是一個書籍 id
    { path: 'ranking', component: RankingPageComponent },
    // 閱讀器路由
    { path: 'reader/:id', component: EbookReaderComponent },
    // { path: 'new-arrivals', component: NewArrivalsPageComponent },

    // 當路徑是 /ebook/123 這樣的格式時，顯示書籍詳細頁
    // **注意**：這條帶有 :id 參數的路由，必須放在其他固定路徑（如 cart, library）的後面
    // 否則，路由器會把 'cart' 也當成一個 id 來匹配，導致頁面出錯。
    // [新增] 加入這條帶有參數的路由
    // ':id' 是一個佔位符，代表任何傳入的書籍 ID (例如 /ebooks/1, /ebooks/2)
    { path: ':id', component: BookDetailComponent }

    // 未來您可以繼續在這裡擴充 ebook 功能的其他路由
    // 例如：{ path: 'new', component: CreateBookComponent },
    //      { path: ':id', component: BookDetailComponent },
];
