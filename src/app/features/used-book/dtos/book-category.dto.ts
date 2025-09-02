export interface BookCategoryDto {
    id: number;
    name: string;
    isActive: boolean;
    slug: string;

    // 選擇性欄位（UI 專用，不影響後端）
    isEditing?: boolean;
}
