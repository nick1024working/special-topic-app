// 這個 interface 描述了書籍摘要的資料結構
export interface EBookSummaryDto {
    ebookId: number;
    ebookName: string;
    author: string;
    fixedPrice: number;
    primaryCoverPath: string | null;
}
