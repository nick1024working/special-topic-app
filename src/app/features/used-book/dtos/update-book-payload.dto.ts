import { BookImageDto } from "./book-image-dto";

export interface UpdateBookPayloadDto {

    imageList: BookImageDto[];

    salePrice: number;
    title: string;
    authors: string;
    categoryId: number;

    conditionRatingId: number;
    conditionDescription?: string | null;

    edition: string | null;
    publisher: string | null;
    publicationDate: string | null;
    isbn: string | null;

    bindingId: number;
    languageId: number;
    pages: number | null;
    contentRatingId: number;

    isOnShelf: boolean;

    sellerCountyId: number;
    sellerDistrictId: number;
}
