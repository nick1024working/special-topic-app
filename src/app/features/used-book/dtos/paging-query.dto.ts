export const SORT_BY = ['updated', 'created', 'price'] as const;
export const SORT_DIR = ['asc', 'desc'] as const;

export type SortBy = typeof SORT_BY[number];
export type SortDir = typeof SORT_DIR[number];

export interface PagingQueryDto {
    pageIndex: number;
    pageSize: number;
    sortBy: SortBy;
    sortDir: SortDir;
}

export const DEFAULT_PAGING_QUERY: PagingQueryDto = {
    pageIndex: 1,
    pageSize: 20,
    sortBy: 'updated',
    sortDir: 'desc',
};
