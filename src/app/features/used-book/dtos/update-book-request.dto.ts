import { UpdateBookImageRequestDto } from "./update-book-image-request.dto";

export interface UpdateBookRequestDto {

    imageList: UpdateBookImageRequestDto[];

    sellerDistrictId: number;
    salePrice: number;
    title: string;
    authors: string;

    categoryId: number;

    conditionRatingId: number;
    conditionDescription?: string | null;

    edition?: string | null;
    publisher?: string | null;
    publicationDate?: string | null;
    isbn?: string | null;

    bindingId: number;
    languageId: number;
    pages?: number;
    contentRatingId: number;

    isOnShelf: boolean;
}
