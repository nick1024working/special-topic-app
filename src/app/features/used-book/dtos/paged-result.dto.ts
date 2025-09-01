export interface PagedResultDto<T> {
    items: T[];
    pageIndex: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
    hasNextPage: boolean;
}
