import { Component, ElementRef, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

// 路徑依你的目錄調整：此檔位於 shared/components/top-content/，auth 在 shared/auth/
import { AuthService } from '../../auth/auth.service';
import { Me } from '../../auth/auth.types';

@Component({
  selector: 'app-sh-top-content',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './top-content.component.html',
  styleUrl: './top-content.component.css'
})
export class TopContentComponent implements AfterViewInit, OnDestroy {
  // ====== 新增：從 AuthService 取目前使用者，給樣板用 ======
  private auth = inject(AuthService);
  me$: Observable<Me | null> = this.auth.user$;

  // ====== 你原本的欄位 / 事件處理 ======
  private headerWrap!: HTMLElement | null;
  private scrollHandler!: () => void;
  private clickHandler!: (e: Event) => void;
  private docClickHandler!: (e: Event) => void;

  constructor(private el: ElementRef) { }

  // ====== 新增：登出按鈕會呼叫 ======
  logout(): void {
    this.auth.logout().subscribe({
      complete: () => {
        // 需要可選擇刷新或導頁
        // location.reload();
      }
    });
  }

  ngAfterViewInit(): void {
    this.headerWrap = this.el.nativeElement.querySelector('#header-wrap');

    // Search toggle
    if (this.headerWrap) {
      // console.log('headerWrap 已找到');

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
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    if (this.clickHandler && this.headerWrap) {
      this.headerWrap.removeEventListener('click', this.clickHandler);
    }
    if (this.docClickHandler) {
      document.removeEventListener('click', this.docClickHandler);
    }
  }
}
