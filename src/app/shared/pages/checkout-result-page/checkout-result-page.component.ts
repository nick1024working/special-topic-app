import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-sh-checkout-result-page',
    standalone: true,
    imports: [],
    templateUrl: './checkout-result-page.component.html',
    styleUrl: './checkout-result-page.component.css'
})
export class CheckoutResultPageComponent {
    private readonly route = inject(ActivatedRoute);

    status = signal<'success'|'failure'|'pending'>('pending');
    orderNo = this.route.snapshot.queryParamMap.get('orderNo')!;

    ngOnInit() {
        // this.http.get<OrderResultDto>('/api/orders/$')
    }
}
