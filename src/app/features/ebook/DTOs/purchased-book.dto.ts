// src/app/features/ebook/DTOs/purchased-book.dto.ts
export interface PurchasedBookDto {
    ebookId: number;
    ebookName: string;
    author: string;
    primaryCoverPath: string | null;
    isReadable: boolean;
    readingProgress: string | null;
}
