ng g c features/used-book/components/ --skip-tests
ng g s features/used-book/services/used-book-admin --skip-tests
ng g c features/used-book/pages/ --skip-tests

ng g i features/used-book/dtos/image-item-dto
ng g i features/used-book/dtos/seller-book-list-item.dto
ng g i features/used-book/dtos/admin-book-list-item.dto


ng g c features/used-book/pages/public-book-list-page --skip-tests

ng g c features/used-book/pages/public-book-detail-page --skip-tests
ng g c features/used-book/components/public-book-detail --skip-tests

<!-- 應該要用 Seller 版型 -->
ng g c features/used-book/pages/create-book-page --skip-tests
ng g c features/used-book/pages/edit-book-page --skip-tests
ng g c features/used-book/pages/seller-book-list-page --skip-tests

<!-- 應該要用 Admin 版型 -->
ng g c features/used-book/pages/admin-book-list-page --skip-tests
ng g c features/used-book/pages/admin-category-page --skip-tests
ng g c features/used-book/pages/admin-sale-tage-page --skip-tests
