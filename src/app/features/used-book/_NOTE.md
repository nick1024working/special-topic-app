ng g c features/used-book/components/ --skip-tests
ng g s features/used-book/services/sale-tag --skip-tests
ng g c features/used-book/pages/ --skip-tests
ng g i features/used-book/dtos/

<!-- 公版 -->
ng g c shared/components/header --skip-tests
ng g c shared/components/top-content --skip-tests


ng g i features/used-book/dtos/paged-result.dto

ng g c features/used-book/pages/home-page --skip-tests
ng g c features/used-book/components/book-filter --skip-tests

<!-- 應該要用 Seller 版型 -->
ng g c features/used-book/pages/create-book-page --skip-tests
ng g c features/used-book/pages/edit-book-page --skip-tests
ng g c features/used-book/pages/seller-book-list-page --skip-tests

<!-- 應該要用 Admin 版型 -->
ng g c features/used-book/pages/admin-category-page --skip-tests


Dropzone.js
npm install dropzone
功能：提供拖曳/點擊上傳圖片、檔案的 UI 和行為。
import Dropzone from 'dropzone';

SortableJS
npm install sortablejs
功能：讓列表、圖片、卡片等可拖曳排序。
import Sortable from 'sortablejs';

Swiper
npm install swiper
功能：輪播滑動套件。
import Swiper from 'swiper';
