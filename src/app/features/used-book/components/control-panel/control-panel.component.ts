import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/used-book-auth.service';
import { FormsModule } from '@angular/forms';
import { switchMap, tap } from 'rxjs';

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
    readonly sellerIdList = signal<string[]>([]);
    currentSellerId: string | null = null;

    // UI 資料
    isOpen = signal(false);

    // ========== 核心函數 ==========

    pushCurrentSellerId() {
        this._authSvc.getCurrentSeller().subscribe({
            next: (res) => this.currentSellerId = res,
            error: (err) => console.error(["pushCurrentSellerId"], err),
        })
    }

    // ========== HOOK ==========

    ngOnInit(): void {
        this._authSvc.getSellerList()
        .pipe(
            tap(list => this.sellerIdList.set(list)),
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

    togglePanel(btn: HTMLButtonElement) {
        this.isOpen.update(v => !v);
        btn.blur();
    }


}
