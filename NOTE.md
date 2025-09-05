周一 放資料到老師HD 
週二~三 各自練
週四錄影 結訓


<!-- 開啟cartSidebar -->
async onAddCart() {
    const el = document.getElementById('cartSidebar');
    if (!el) return;
    const off = bootstrap.Offcanvas.getOrCreateInstance(el);
    off.show();
}
