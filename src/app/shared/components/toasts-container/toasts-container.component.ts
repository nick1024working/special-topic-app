import { Component, inject, ElementRef, effect } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-sh-toasts-container',
    standalone: true,
    templateUrl: './toasts-container.component.html',
    styleUrl: './toasts-container.component.css'
})
export class ToastsContainerComponent {
    readonly svc = inject(ToastService);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private scheduled = false;

    constructor() {
        effect(() => {
            this.svc.toasts(); // 只訂閱，不做事
            if (!this.scheduled) {
                this.scheduled = true;
                setTimeout(() => {
                    this.scheduled = false;
                    this.initNewToasts();
                }, 0); // 下一個 macrotask，DOM 已更新
            }
        });
    }

    private initNewToasts() {
        const root = this.host.nativeElement;
        // 只抓尚未初始化過的 .toast
        const newEls = root.querySelectorAll<HTMLElement>('.toast:not([data-ub-inited])');

        newEls.forEach(el => {
            // 標記避免重複初始化
            el.setAttribute('data-ub-inited', '1');

            // 讓 Bootstrap 讀取你 HTML 上的 data-bs-delay / data-bs-autohide
            const instance = new bootstrap.Toast(el);
            (el as any)._bsToast = instance;

            // 關閉後自動從 service 移除 + 回收
            el.addEventListener('hidden.bs.toast', () => {
                instance.dispose();
                const id = el.getAttribute('data-id');
                if (id) this.svc.remove(id);
                //（可選）提前移除 DOM；不寫也會被 Angular 移除
                el.remove();
            });

            instance.show();
        });
    }
}
