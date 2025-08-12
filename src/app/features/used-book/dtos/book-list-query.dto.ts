// 固定值清單（as const 讓字面量保留）
// ▶ 任何地方需要合法值清單或型別，都從這裡匯入
export const BOOK_STATUS = ['all', 'onshelf', 'unsold'] as const;
export const SORT_BY = ['updated', 'created', 'price'] as const;
export const SORT_DIR = ['asc', 'desc'] as const;

export type BookStatus = typeof BOOK_STATUS[number];
export type SortBy = typeof SORT_BY[number];
export type SortDir = typeof SORT_DIR[number];

export interface BookListQuery {
    // normalize 後一定有值
    bookStatus: BookStatus;
    sortBy: SortBy;
    sortDir: SortDir;

    // 未設定 → 用 undefined，而非 null
    keyword?: string;
    minPrice?: number;
    maxPrice?: number;

    // page?: number;
    // pageSize?: number;
}

export const DEFAULT_BOOK_LIST_QUERY: BookListQuery = {
    bookStatus: 'all',
    sortBy: 'updated',
    sortDir: 'desc',
};
