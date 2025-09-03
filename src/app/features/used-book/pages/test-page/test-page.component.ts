import { Component, inject } from '@angular/core';
import { CartSidebarApi } from 'app/shared/components/cart-sidebar/cart-sidebar.api';
import { UpsertCartItemRequest } from 'app/shared/dtos/upsert-cart-item-request.dto';
import { CartService } from 'app/shared/services/cart.service';
import { RandomUtil } from '../../utils/random.util';
import { ToastService } from 'app/shared/services/toast.service';
import { TestService } from '../../services/test.service';

@Component({
    selector: 'app-ub-test-page',
    standalone: true,
    imports: [],
    templateUrl: './test-page.component.html',
    styleUrls: ['./test-page.component.css', '../../styles/bs-custom-override.scss',]
})
export class TestPageComponent {
    private readonly cartSvc = inject(CartService);
    private readonly cartSidebarApi = inject(CartSidebarApi);
    private readonly toastSvc = inject(ToastService);
    private readonly testSvc = inject(TestService);

    onAddCartEbook() {
        const request: UpsertCartItemRequest = {
            productProvider: 'EBook',
            id: RandomUtil.string(8),
            name: RandomUtil.string(3) + "_win98跟我學",
            imageUrl: "https://placehold.co/200x200?text=WIN-98.jpg",
            unitPrice: RandomUtil.range(99, 999),
            quantity: RandomUtil.range(1, 5),
        };
        this.cartSvc.upsertItem(request).subscribe({
            next: () => this.cartSidebarApi.show(),
        })
    }

    onAddCartFund() {
        const request: UpsertCartItemRequest = {
            productProvider: 'Fund',
            id: RandomUtil.string(8),
            name: RandomUtil.string(3) + "_一堆騙錢拖鞋",
            imageUrl: "https://placehold.co/200x200?text=Slippers.jpg",
            unitPrice: RandomUtil.range(999, 4999),
            quantity: RandomUtil.range(1, 4),
        };
        this.cartSvc.upsertItem(request).subscribe({
            next: () => this.cartSidebarApi.show(),
        })
    }

    onClearCart() {
        this.cartSidebarApi.clear();
    }

    doSomething() {
        this.toastSvc.warn("info");
    }

    doYo() {
        this.toastSvc.show("infoinfoinfoinfoinfoinfoinfoinfoinfoinfoinfoinfoinfoinfo", { 'header': "管理中心管理中心管理中心管理中心管理中心", 'level': 'primary', autohide: false });
    }

    setCookies() {
        this.testSvc.setCookie().subscribe({
            next: () => console.log("done"),
            error: (err) => console.error(err),
        });
    }

}
