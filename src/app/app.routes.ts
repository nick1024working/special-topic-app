import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { HomePageComponent } from './shared/pages/home-page/home-page.component';
import { ErrorPageComponent } from './shared/pages/error-page/error-page.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
// import { MemberLoginComponent } from './features/member/member-login/member-login.component';
import { CartPageComponent } from './shared/pages/cart-page/cart-page.component';
import { CheckoutPageComponent } from './shared/pages/checkout-page/checkout-page.component';
// import { MemberRegisterComponent } from './features/member/member-register/member-register.component';
import { CheckoutReviewPageComponent } from './shared/pages/checkout-review-page/checkout-review-page.component';
import { CheckoutResultPageComponent } from './shared/pages/checkout-result-page/checkout-result-page.component';
import { MainSellerLayoutComponent as UsedBookSellerLayoutComponent } from './features/used-book/layouts/main-seller-layout/main-seller-layout.component';

// [修改] 更新 import 路徑和元件名稱
import { BankTransferInfoPageComponent } from './shared/pages/bank-transfer-info-page/bank-transfer-info-page.component';

/** 主路由 */
// 此處把各子服務路由分開管理，減少衝突。
// 此處使用純版型方式管理
// NOTE: wildcard 放在最後匹配。
export const routes: Routes = [
    // 公開版型
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: '', component: HomePageComponent, title: "ProBookLand - 給愛書人的多功能平台" },
            { path: 'login', redirectTo: 'member/login', pathMatch: 'full' },
            { path: 'register', redirectTo: 'member/register', pathMatch: 'full' },


            // 購物車頁面
            { path: 'cart', component: CartPageComponent, title: '購物車'},
            { path: 'checkout', component: CheckoutPageComponent, title: '結帳'},
            // 這是結帳流程的一部分，放在 review 和 result 之間很合理
            { path: 'checkout/transfer/:orderId', component: BankTransferInfoPageComponent, title: '銀行轉帳資訊' },
            { path: 'checkout/review', component: CheckoutReviewPageComponent, title: '結帳確認'},
            { path: 'checkout/result', component: CheckoutResultPageComponent},

            // ========== 以下為各子服務 ==========
            // 可各自更改各自花括號內容，但名稱請勿搶名。
            {
                path: 'ebook',
                loadChildren: () =>
                    import('./features/ebook/ebook.routes').then((m) => m.EBOOK_ROUTES),
            },
            {
                path: 'forum',
                loadChildren: () =>
                    import('./features/forum/forum.routes').then((m) => m.FORUM_ROUTES),
            },
            {
                path: 'fund',
                loadChildren: () =>
                    import('./features/fund/fund.routes').then((m) => m.FUND_ROUTES),
            },
            {
                path: 'used-book',
                loadChildren: () =>
                    import('./features/used-book/used-book.routes').then((m) => m.USED_BOOK_ROUTES),
            },
            {
                path: 'member',
                loadChildren: () =>
                    import('./features/member/member.routes').then((m) => m.MEMBER_ROUTES),
            },
        ]
    },
    // 管理員版型
    {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [
            {
                path: 'used-book',
                loadChildren: () =>
                    import('./features/used-book/used-book-admin.routes').then((m) => m.USED_BOOK_ADMIN_ROUTES),
            },
        ]
    },
    // 二手書C2C賣家
    {
        path: 'used-book-seller',
        component: UsedBookSellerLayoutComponent,
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./features/used-book/used-book-seller.routes').then((m) => m.USED_BOOK_SELLER_ROUTES),
            },
        ]
    },
    { path: '**', component: ErrorPageComponent }

];
