// 檔案路徑: src/app/features/ebook/DTOs/ebook-summary.dto.ts

export interface EBookSummaryDto {
    ebookId: number;
    ebookName: string;
    author: string;
    fixedPrice: number; // 確保是 camelCase (小寫 f 開頭)
    primaryCoverPath: string | null;
}
