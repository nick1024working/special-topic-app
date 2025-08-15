// src/app/features/ebook/ebook-reader/ebook-reader.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// 匯入 PdfViewerModule
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
    selector: 'app-ebook-reader',
    standalone: true,
    imports: [CommonModule, PdfViewerModule], // 在此加入 PdfViewerModule
    templateUrl: './ebook-reader.component.html',
    styleUrls: ['./ebook-reader.component.css']
})
export class EbookReaderComponent implements OnInit {

    // [修改] 移除 ArrayBuffer 型別
    pdfSrc: string | Uint8Array = ''; // 用於存放 PDF 的來源路徑
    totalPages: number = 0;
    currentPage: number = 1;

    constructor(private route: ActivatedRoute) { }

    ngOnInit(): void {
        const bookId = this.route.snapshot.paramMap.get('id');
        if (!bookId) {
            console.error('無效的書籍 ID');
            return;
        }

        // 直接設定後端 API 的完整路徑
        this.pdfSrc = `https://localhost:7104/api/ebooks/${bookId}/file`;

        // ** 附註：若要快速測試，可暫時換成線上範例 PDF **
        // this.pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
    }

    // pdf-viewer 元件載入完成後會呼叫此方法
    afterLoadComplete(pdfData: any): void {
        this.totalPages = pdfData.numPages;
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    // [新增] 處理直接跳頁的邏輯
    jumpToPage(pageStr: string): void {
        // 1. 將輸入的字串轉為數字
        const page = Number(pageStr);

        // 2. 驗證輸入是否為有效的整數，且在頁碼範圍內
        if (Number.isInteger(page) && page >= 1 && page <= this.totalPages) {
            // 3. 如果有效，就跳轉到該頁
            this.currentPage = page;
        }
        // (可選) 如果輸入無效，可以考慮給予提示或將輸入框的值重設為當前頁碼
        // 為了簡潔，我們先不處理無效輸入
    }

}
