// src/app/features/ebook/DTOs/category.dto.ts
export interface CategoryOptionDto {
    id: number;
    name: string;
}
export interface HierarchicalCategoryDto {
    id: number;
    name: string;
    children: CategoryOptionDto[];
}
