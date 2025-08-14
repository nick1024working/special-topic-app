export const BOOK_STATUS = ['all', 'onshelf', 'unsold'] as const;
export const SORT_BY = ['updated', 'created', 'price'] as const;
export const SORT_DIR = ['asc', 'desc'] as const;

export type BookStatus = typeof BOOK_STATUS[number];
export type SortBy = typeof SORT_BY[number];
export type SortDir = typeof SORT_DIR[number];

export interface BookListQuery {
    bookStatus: BookStatus;
    sortBy: SortBy;
    sortDir: SortDir;

    keyword?: string;
    minPrice?: number;
    maxPrice?: number;

    categoryId?: number;
    saleTagIds?: number[];

    // TODO: 後端尚未啟用
    page?: number;
    pageSize?: number;
}

export const DEFAULT_BOOK_LIST_QUERY: BookListQuery = {
    bookStatus: 'onshelf',
    sortBy: 'updated',
    sortDir: 'desc',
};
