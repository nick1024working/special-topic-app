import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-sh-checkout-review-page',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './checkout-review-page.component.html',
    styleUrl: './checkout-review-page.component.css'
})
export class CheckoutReviewPageComponent {

    // ========== 工具函數 ==========

    scrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }
}
