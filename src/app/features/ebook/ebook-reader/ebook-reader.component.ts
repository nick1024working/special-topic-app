import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// [新增] 匯入 PdfViewerModule
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-ebook-reader',
  standalone: true,
  imports: [CommonModule, PdfViewerModule], // [修改] 在此加入 PdfViewerModule
  templateUrl: './ebook-reader.component.html',
  styleUrls: ['./ebook-reader.component.css']
})
export class EbookReaderComponent implements OnInit {

  // [修改] 屬性大幅簡化
  pdfSrc: string | ArrayBuffer | Uint8Array = ''; // 用於存放 PDF 的來源路徑
  totalPages: number = 0;
  
  // currentPage 使用雙向綁定，讓按鈕和檢視器同步
  currentPage: number = 1;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (!bookId) {
      console.error('無效的書籍 ID');
      return;
    }
    
    // [修改] 不再讀取模擬資料，而是設定後端 API 的路徑
    // 這個 URL 必須是後端提供，能直接取得 PDF 檔案的端點
    // 範例：'https://my-api.com/api/ebooks/301/file'
    this.pdfSrc = `/api/ebooks/${bookId}/file`; 

    // ** 為了方便您在沒有後端的情況下立即測試，可以先用一個線上範例 PDF **
    // this.pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  }

  // [新增] 這是 pdf-viewer 元件載入完成後會呼叫的事件處理器
  afterLoadComplete(pdfData: any): void {
    this.totalPages = pdfData.numPages;
  }

  // [修改] 翻頁邏輯變得更簡單
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