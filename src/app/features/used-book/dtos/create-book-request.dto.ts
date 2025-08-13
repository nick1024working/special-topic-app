import { CreateBookImageRequestDto } from "./create-book-image-request.dto";

export interface CreateBookRequestDto {

  imageList: CreateBookImageRequestDto[];


  sellerDistrictId: number;
  salePrice: number;
  title: string;
  authors: string;

  categoryId: number;

  conditionRatingId: number;
  conditionDescription?: string;

  edition?: string;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;

  bindingId?: number;
  languageId?: number;
  pages?: number;
  contentRatingId: number;

  isOnShelf: boolean;
}
