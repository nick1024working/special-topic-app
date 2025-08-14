export interface CreateBookRequestDto {

    imageList: File[];

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
