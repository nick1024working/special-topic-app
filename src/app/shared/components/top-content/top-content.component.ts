import { Component, ElementRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TopContentApi } from './top-content.api';

@Component({
    selector: 'app-sh-top-content',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './top-content.component.html',
    styleUrl: './top-content.component.css'
})
export class TopContentComponent {
    private readonly _api = inject(TopContentApi);
    private readonly el = inject(ElementRef);

    private headerWrap!: HTMLElement | null;
    private scrollHandler!: () => void;
    private clickHandler!: (e: Event) => void;
    private docClickHandler!: (e: Event) => void;

    cartItemCount = signal<number | undefined>(undefined);

    ngAfterViewInit(): void {
        this.headerWrap = this.el.nativeElement.querySelector('#header-wrap');

        // Search toggle
        if (this.headerWrap) {
            this.clickHandler = (e: Event) => {
                const btn = (e.target as HTMLElement).closest('.search-toggle');
                if (!btn) return;

                e.preventDefault();
                this.headerWrap!.classList.toggle('show');
                btn.classList.toggle('active');

                const input = this.headerWrap!.querySelector('.search-input') as HTMLInputElement;
                if (input) input.focus();
            };

            this.docClickHandler = (e: Event) => {
                const isInsideSearch =
                    this.headerWrap!.contains(e.target as Node) ||
                    (e.target as HTMLElement).closest('.search-toggle');

                if (!isInsideSearch) {
                    this.headerWrap!.classList.remove('show');
                    this.headerWrap!
                        .querySelectorAll('.search-toggle.active')
                        .forEach(b => b.classList.remove('active'));
                }
            };

            this.headerWrap.addEventListener('click', this.clickHandler);
            document.addEventListener('click', this.docClickHandler);
        } else {
            console.warn('[HeaderWrapComponent] 找不到 #header-wrap，跳過 search toggle 初始化');
        }

        // 綁定改變總計的 api
        this._api.cartItemCount = (count) => this.cartItemCount.set(count);;
    }

    ngOnDestroy(): void {
        // 移除事件監聽，避免記憶體洩漏
        if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
        if (this.clickHandler && this.headerWrap) {
            this.headerWrap.removeEventListener('click', this.clickHandler);
        }
        if (this.docClickHandler) {
            document.removeEventListener('click', this.docClickHandler);
        }
    }
}
