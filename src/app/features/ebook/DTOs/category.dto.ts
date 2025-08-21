// src/app/features/ebook/DTOs/category.dto.ts

// 代表一個可選的分類選項
export interface CategoryOptionDto {
    id: number;
    name: string;
}

// 代表一個父分類群組
export interface HierarchicalCategoryDto {
    id: number;
    name: string;
    children: CategoryOptionDto[];
}
