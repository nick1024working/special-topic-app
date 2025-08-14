import { BookImageDto } from "./book-image-dto";

export interface PublicBookDetailDto {
    imageList: BookImageDto[];

    id: string;
    sellerId: string;
    sellerCountyName: string;
    sellerDistrictName: string;
    salePrice: number;

    title: string;
    authors: string;
    categoryName: string;
    conditionRatingName: string;
    conditionDescription: string;
    edition: string;
    publisher: string;
    publicationDate: string; // ISO or yyyy-MM-dd
    isbn: string;
    bindingName: string;
    languageName: string;
    pages: number;
    contentRatingName: string;

    slug: string;

    createdAt: string; // ISO
    updatedAt: string; // ISO
}
