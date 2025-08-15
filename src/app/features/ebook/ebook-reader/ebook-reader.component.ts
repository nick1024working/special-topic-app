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
}
