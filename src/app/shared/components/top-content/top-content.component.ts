import { Component, ElementRef } from '@angular/core';

@Component({
    selector: 'app-sh-top-content',
    standalone: true,
    imports: [],
    templateUrl: './top-content.component.html',
    styleUrl: './top-content.component.css'
})
export class TopContentComponent {
    private headerWrap!: HTMLElement | null;
    private scrollHandler!: () => void;
    private clickHandler!: (e: Event) => void;
    private docClickHandler!: (e: Event) => void;

    constructor(private el: ElementRef) { }

    ngAfterViewInit(): void {
        this.headerWrap = this.el.nativeElement.querySelector('#header-wrap');

        // Search toggle
        if (this.headerWrap) {
            console.log('headerWrap 已找到');

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

        console.log('[HeaderWrapComponent] 初始化完成');
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
