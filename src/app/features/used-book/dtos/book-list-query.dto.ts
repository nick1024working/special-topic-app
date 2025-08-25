import { DEFAULT_PAGING_QUERY, PagingQueryDto } from "./paging-query.dto";

export const BOOK_STATUS = ['all', 'inactive', 'onshelf', 'unsold'] as const;

export type BookStatus = typeof BOOK_STATUS[number];

export interface BookListQuery {
    paging: PagingQueryDto;
    bookStatus: BookStatus;
    keyword?: string;
    categoryId?: number;
    saleTagIds?: number[];
    minPrice?: number;
    maxPrice?: number;
}

export const DEFAULT_BOOK_LIST_QUERY: BookListQuery = {
    paging: DEFAULT_PAGING_QUERY,
    bookStatus: 'all',
};
