export interface PublicBookListItemDto {
    coverImageUrl: string;
    saleTagList: string[];
    id: string;                 // Guid -> string
    title: string;
    authors: string;
    salePrice: number;          // decimal -> number
    conditionRating: string;
    slug: string;
}
