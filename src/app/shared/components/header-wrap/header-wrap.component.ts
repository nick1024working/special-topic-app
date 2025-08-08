import { Component, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-header-wrap',
    standalone: true,
    templateUrl: './header-wrap.component.html',
    styleUrls: [
        './header-wrap.component.css'
    ],
    imports: [RouterModule]
})
export class HeaderWrapComponent implements AfterViewInit, OnDestroy {
    private header!: HTMLElement | null;
    private headerWrap!: HTMLElement | null;
    private scrollHandler!: () => void;
    private clickHandler!: (e: Event) => void;
    private docClickHandler!: (e: Event) => void;

    constructor(private el: ElementRef) { }

    ngAfterViewInit(): void {
        this.header = this.el.nativeElement.querySelector('#header');
        this.headerWrap = this.el.nativeElement.querySelector('#header-wrap');

        // Sticky header
        if (this.header) {
            const headerTop = this.header.offsetTop;

            this.scrollHandler = () => {
                if (window.scrollY >= headerTop) {
                    this.header!.classList.add('fixed-top');
                } else {
                    this.header!.classList.remove('fixed-top');
                }
                console.log('[HeaderWrapComponent] toggleFixedHeader 執行');
            };

            window.addEventListener('scroll', this.scrollHandler);
            this.scrollHandler(); // 初始化
        } else {
            console.warn('[HeaderWrapComponent] 找不到 #header，跳過 sticky header 初始化');
        }

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
