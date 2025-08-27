import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private readonly _http = inject(HttpClient);

    private readonly baseUrl = `${environment.apiBaseUrl}/api/payment`;

}
