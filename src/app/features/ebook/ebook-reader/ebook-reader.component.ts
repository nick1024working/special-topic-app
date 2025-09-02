// src/app/features/ebook/ebook-reader/ebook-reader.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// 匯入 PdfViewerModule
import { PdfViewerComponent, PdfViewerModule } from 'ng2-pdf-viewer';
import { UpdateProgressDto } from '../DTOs/update-progress.dto';
import { EbookService } from '../services/ebook.service';
import { Subject, Subscription } from 'rxjs'; // <-- [修正]
import { debounceTime, catchError, finalize } from 'rxjs/operators';
import { NzSpinModule } from "ng-zorro-antd/spin"; // <-- [修正]
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-ebook-reader',
    standalone: true,
    imports: [CommonModule, PdfViewerModule, NzSpinModule], // 在此加入 PdfViewerModule
    templateUrl: './ebook-reader.component.html',
    styleUrls: ['./ebook-reader.component.css']
})
export class EbookReaderComponent implements OnInit, OnDestroy {

    // [新增] 用於控制載入動畫的旗標
    isLoading = true;

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

        this.isLoading = true;

        // [重大修改] 調整執行順序以解決 Token 問題
        // 步驟 1: 先取得上次的閱讀頁碼
        this.ebookService.getReadingProgress(this.ebookId).subscribe({
            next: (progress) => {
                if (progress.currentPage > 1) {
                    this.currentPage = progress.currentPage;
                }
                this.loadPdfFile();
            },
            error: (err: HttpErrorResponse) => {
                console.warn('讀取進度失敗，將嘗試直接載入 PDF:', err);
                this.loadPdfFile();
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



    // [新增] 建立一個專門載入 PDF 的方法
    private loadPdfFile(): void {
        this.ebookService.getEbookFile(this.ebookId).pipe(
            // [關鍵修正] 無論成功或失敗，最後都將 isLoading 設為 false
            finalize(() => {
                this.isLoading = false;
            })
        ).subscribe({
            next: (pdfBlob) => {
                this.pdfSrc = URL.createObjectURL(pdfBlob);
                // [移除] 這裡不再需要設定 isLoading = false
            },
            error: (err) => {
                console.error('下載 PDF 檔案失敗:', err);
                // [移除] 這裡也不再需要設定 isLoading = false
            }
        });
    }

    // pdf-viewer 元件載入完成後會呼叫此方法
    // [修改] 在 PDF 載入完成後，才設定初始頁碼
    // [修改] 這裡只負責處理總頁數
    afterLoadComplete(pdfData: any): void {
        this.totalPages = pdfData.numPages;
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
