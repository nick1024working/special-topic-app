

<!-- 開啟cartSidebar -->
async onAddCart() {
    const el = document.getElementById('cartSidebar');
    if (!el) return;
    const off = bootstrap.Offcanvas.getOrCreateInstance(el);
    off.show();
}
