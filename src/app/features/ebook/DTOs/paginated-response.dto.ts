// 這個 interface 描述了分頁回應的通用結構
export interface PaginatedResponseDto<T> {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    items: T[];
}
