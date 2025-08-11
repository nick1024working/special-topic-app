import { ImageItemDto } from "./image-item-dto";

export interface PublicBookDetailDto {
    imageList: string[];
    title: string;
    authors: string;
    publisher: string;
    publicationDate: string; // ISO or yyyy-MM-dd
    isbn: string;
    pages: number;
    edition: string;
    languageName: string;
    bindingName: string;
    contentRatingName: string;
    conditionRatingName: string;
    conditionDescription: string;
    salePrice: number;
    sellerId: string;
    sellerCountyName: string;
    sellerDistrictName: string;
    createdAt: string; // ISO
    updatedAt: string; // ISO
}
