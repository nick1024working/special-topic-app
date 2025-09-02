// 檔案路徑: src/app/features/ebook/DTOs/ranking-book.dto.ts
export interface RankingBookDto {
    id: number;
    title: string;
    author: string;
    coverImage: string | null;
    price: number;
    fixedPrice?: number; // [新增] 加上可選的 fixedPrice 屬性
}