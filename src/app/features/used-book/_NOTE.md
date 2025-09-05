ng g c features/used-book/components/ --skip-tests
ng g s features/used-book/services/sale-tag --skip-tests
ng g c features/used-book/pages/ --skip-tests
ng g c features/used-book/layouts/ --skip-tests
ng g i features/used-book/dtos/

<!-- 公版 -->
ng g c shared/pages/checkout-result-page --skip-tests
ng g c shared/pages/thank-you-page --skip-tests
ng g c shared/components/user-sidebar --skip-tests
ng g i shared/dtos/cart-item.dto  --skip-tests
ng g i shared/dtos/cart.dto  --skip-tests
ng g c layouts/user-layout --skip-tests


ng g c features/used-book/components/panel --skip-tests

ng g c features/used-book/components/manage-sale-tag --skip-tests
ng g c features/used-book/components/manage-category --skip-tests
<!-- 應該要用 Seller 版型 -->
ng g c features/used-book/pages/edit-book-page --skip-tests
ng g c features/used-book/pages/user-order-detail-page --skip-tests

<!-- 應該要用 Admin 版型 -->
ng g c features/used-book/layouts/main-seller-layout --skip-tests


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
