// src/app/features/ebook/ebook-reader/ebook-reader.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// 匯入 PdfViewerModule
import { PdfViewerComponent, PdfViewerModule } from 'ng2-pdf-viewer';
import { UpdateProgressDto } from '../DTOs/update-progress.dto';
import { EbookService } from '../services/ebook.service';
import { Subject, Subscription } from 'rxjs'; // <-- [修正]
import { debounceTime } from 'rxjs/operators'; // <-- [修正]

@Component({
    selector: 'app-ebook-reader',
    standalone: true,
    imports: [CommonModule, PdfViewerModule], // 在此加入 PdfViewerModule
    templateUrl: './ebook-reader.component.html',
    styleUrls: ['./ebook-reader.component.css']
})
export class EbookReaderComponent implements OnInit, OnDestroy {

    // [修改] 移除 ArrayBuffer 型別
    pdfSrc: string | Uint8Array = ''; // 用於存放 PDF 的來源路徑
    totalPages: number = 0;
    currentPage: number = 1;

    ebookId!: number; // 用來儲存書籍 ID

    // 用於延遲發送更新請求，避免頻繁呼叫 API
    private progressUpdate = new Subject<UpdateProgressDto>();
    // 用於管理訂閱，以便在元件銷毀時取消
    private progressSubscription!: Subscription;
    // [新增] 一個屬性來暫存從後端取得的初始頁碼
    private initialPage: number = 0;




    constructor(private route: ActivatedRoute,
        private ebookService: EbookService,

    ) { }

    ngOnInit(): void {
        const bookIdStr = this.route.snapshot.paramMap.get('id');
        if (!bookIdStr) {
            console.error('無效的書籍 ID');
            return;
        }
        this.ebookId = Number(bookIdStr);

        // 啟動 PDF 檔案的下載
        this.pdfSrc = `https://localhost:7104/api/ebooks/${this.ebookId}/file`;

        // [修改] 這裡只負責取得頁碼，不直接設定 currentPage
        this.ebookService.getReadingProgress(this.ebookId).subscribe({
            next: (progress) => {
                if (progress.currentPage > 0) {
                    this.initialPage = progress.currentPage; // 取得頁碼，並暫存起來
                }
            },
            error: (err) => {
                console.warn('找不到閱讀紀錄或尚未開始閱讀。');
            }
        });


        // 設定延遲更新邏輯：當使用者停止翻頁 2 秒後，才執行 subscribe 內的程式碼
        this.progressSubscription = this.progressUpdate.pipe(
            debounceTime(2000) // 延遲 2 秒
        ).subscribe(progressData => {
            this.ebookService.updateReadingProgress(progressData).subscribe({
                next: () => console.log(`進度已儲存: Page ${progressData.currentPage}/${progressData.totalPages}`),
                error: err => console.error('儲存進度失敗:', err)
            });
        });
    }

    ngOnDestroy(): void {
        if (this.progressSubscription) {
            this.progressSubscription.unsubscribe();
        }
    }

    // pdf-viewer 元件載入完成後會呼叫此方法
    // [修改] 在 PDF 載入完成後，才設定初始頁碼
    afterLoadComplete(pdfData: any): void {
        this.totalPages = pdfData.numPages;

        // [最終修正] 在 PDF 載入完成後，檢查是否有初始頁碼
        if (this.initialPage > 0 && this.initialPage <= this.totalPages) {
            // 使用一個微小的延遲，讓元件有時間初始化完成，再設定頁碼
            setTimeout(() => {
                this.currentPage = this.initialPage;
            }, 100);
        }
    }

    // 處理頁碼變更的核心方法
    onPageChange(pageNumber: number): void {
        if (this.totalPages === 0) return; // 如果總頁數還沒載入完成，就不執行

        // 建立要傳送給後端的 DTO 物件
        const progressData: UpdateProgressDto = {
            ebookId: this.ebookId,
            currentPage: pageNumber,
            totalPages: this.totalPages
        };

        // 將最新的進度資料推入 progressUpdate 這個 Subject 中
        this.progressUpdate.next(progressData);
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.onPageChange(this.currentPage); // [新增]
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.onPageChange(this.currentPage); // [新增]
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
            this.onPageChange(this.currentPage); // [新增]
        }
        // (可選) 如果輸入無效，可以考慮給予提示或將輸入框的值重設為當前頁碼
        // 為了簡潔，我們先不處理無效輸入
    }

}
