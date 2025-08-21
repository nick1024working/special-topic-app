// 檔案路徑: src/app/features/ebook/DTOs/ebook-summary.dto.ts

export interface EBookSummaryDto {
    ebookId: number;
    ebookName: string;
    author: string;
    fixedPrice: number; // 確保是 camelCase (小寫 f 開頭)
    primaryCoverPath: string | null;

    // [新增] 加入實際售價欄位
    actualPrice: number | null;

    // [新增] 加入一個屬性，用來表示這本書是否有可閱讀的 PDF 檔案
    isReadable: boolean;

    // [新增] 加入 categoryName 和 labels 屬性
    // 使用 `?` 將它們標記為可選屬性，因為不是每個地方都會用到
    categoryName?: string;
    labels?: string[];
}
