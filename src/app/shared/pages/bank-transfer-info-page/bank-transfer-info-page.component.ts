import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from 'app/features/ebook/services/order.service'; // 請確認 OrderService 的實際路徑
import { Observable, switchMap } from 'rxjs';

// 定義轉帳資訊的結構 (與之前相同)
export interface BankTransferDetails {
    orderId: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    amount: number;
    paymentDeadline: string;
}

@Component({
  selector: 'app-bank-transfer-info-page',
  standalone: true,
  imports: [],
  templateUrl: './bank-transfer-info-page.component.html',
  styleUrl: './bank-transfer-info-page.component.css'
})
export class BankTransferInfoPageComponent {

}
