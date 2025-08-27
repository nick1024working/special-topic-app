import { IdNameDto } from "./id-name.dto";

export interface PublicBookListItemDto {
    coverImageUrl: string;

    saleTagList: IdNameDto[];
    category: IdNameDto;

    id: string;                 // Guid -> string
    title: string;
    authors: string;
    salePrice: number;          // decimal -> number
    conditionRating: string;
    slug: string;
}
