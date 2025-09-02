import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/used-book-auth.service';
import { FormsModule } from '@angular/forms';
import { switchMap, tap } from 'rxjs';
import { CurrentSellerDto } from '../../dtos/current-seller.dto';

@Component({
    selector: 'app-ub-control-panel',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './control-panel.component.html',
    styleUrls: ['./control-panel.component.css', '../../styles/bs-custom-override.scss',]
})
export class ControlPanelComponent {


    private readonly _authSvc = inject(AuthService);

    // 資料容器
    readonly sellerList = signal<CurrentSellerDto[]>([]);
    currentSellerId: string | null = null;

    // UI 資料
    isOpen = signal(false);
    isDockLeft = signal(false);

    // ========== 核心函數 ==========

    pushCurrentSellerId() {
        this._authSvc.getCurrentSeller().subscribe({
            next: (res) => this.currentSellerId = res,
            error: (err) => console.error(["pushCurrentSellerId"], err),
        })
    }

    sellerToRepr(seller: CurrentSellerDto): string {
        return `${seller.name} (${seller.email.slice(0, 10)}...)`
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this._authSvc.getSellerList()
        .pipe(
            tap(list => this.sellerList.set(list)),
            switchMap(() => this._authSvc.getCurrentSeller()),
            tap(seller => this.currentSellerId = seller)
        )
        .subscribe({
            error: (err) => console.error(["ngOnInit"], err),
        });
    }

    // ========== 事件 ==========

    onSelect(sellerId: string) {
        this._authSvc.setCurrentSeller(sellerId).subscribe({
            next: () => {
                window.location.reload()
            },
            error: (err) => {
                this.currentSellerId = null;
                console.error("[onSelect]", err)
            },
        })
    }



    // ========== 工具 ==========

    toggleOpen(btn: HTMLButtonElement) {
        this.isOpen.update(v => !v);
        btn.blur();
    }

    toggleDock(btn: HTMLButtonElement) {
        this.isDockLeft.update(v => !v);
    }
}
