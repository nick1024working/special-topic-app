export type BookStatus = 'all' | 'onshelf' | 'unsold';
export type SortBy = 'updated' | 'created' | 'price';
export type SortDir = 'asc' | 'desc';

export interface BookListQuery {
  bookStatus?: BookStatus;      // 預設值放常數而不是介面
  keyword?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sortBy?: SortBy;
  sortDir?: SortDir;
  // page?: number;
  // pageSize?: number;
}

export const DEFAULT_BOOK_LIST_QUERY: BookListQuery = {
  bookStatus: 'all',
  sortBy: 'updated',
  sortDir: 'desc',
};
