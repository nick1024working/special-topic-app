import { ParamMap } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { BookListQuery, DEFAULT_BOOK_LIST_QUERY, BOOK_STATUS } from '../dtos/book-list-query.dto';
import { SORT_BY, SORT_DIR } from '../dtos/paging-query.dto';

// 共用工具：白名單校驗
export function oneOf<T extends readonly string[]>(
    raw: string | null,
    list: T): T[number] | undefined {
    return raw && (list as readonly string[]).includes(raw) ? (raw as T[number]) : undefined;
}

// 共用工具：字串 → number（非法或缺值回 undefined）
export function toNum(raw: string | null): number | undefined {
    if (raw == null) return undefined;
    const s = raw.trim();
    if (s === '') return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
}

// 共用工具：數值夾取（可用在 page/pageSize）
export function clamp(n: number | undefined, min?: number, max?: number): number | undefined {
    if (n == null) return undefined;
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
}

/** ParamMap → BookListQuery */
/** 從 URL 取值、轉型並與預設合併，得到乾淨的 BookListQuery */
export function buildQueryFromUrl(q: ParamMap): BookListQuery {
    const partial: Partial<BookListQuery> = {
        paging: {
            pageIndex: clamp(toNum(q.get('paging.pageIndex')), 1) ?? DEFAULT_BOOK_LIST_QUERY.paging.pageIndex,
            pageSize: clamp(toNum(q.get('paging.pageSize')), 1, 100) ?? DEFAULT_BOOK_LIST_QUERY.paging.pageSize,
            sortBy: oneOf(q.get('paging.sortBy'), SORT_BY) ?? DEFAULT_BOOK_LIST_QUERY.paging.sortBy,
            sortDir: oneOf(q.get('paging.sortDir'), SORT_DIR) ?? DEFAULT_BOOK_LIST_QUERY.paging.sortDir,
        },
        bookStatus: oneOf(q.get('bookStatus'), BOOK_STATUS) ?? DEFAULT_BOOK_LIST_QUERY.bookStatus,
        keyword: q.get('keyword')?.trim() || undefined,
        categoryId: toNum(q.get('categoryId')),
        saleTagIds: q.getAll('saleTagIds')
            .map(s => Number(s))
            .filter(Number.isFinite),
        minPrice: toNum(q.get('minPrice')),
        maxPrice: toNum(q.get('maxPrice')),
    };

    const merged: BookListQuery = { ...DEFAULT_BOOK_LIST_QUERY, ...partial };

    // 邏輯矯正：價格上下限（min > max 時交換）
    if (merged.minPrice != null && merged.maxPrice != null && merged.minPrice > merged.maxPrice) {
        [merged.minPrice, merged.maxPrice] = [merged.maxPrice, merged.minPrice];
    }
    return merged;
}

/** 共用：BookListQuery → 乾淨的字典 (no undefined/null) */
export function buildPlainParams(query: BookListQuery): Record<string, string | string[]> {
    const plain: Record<string, string | string[]> = {};
    plain['paging.pageIndex'] = String(query.paging.pageIndex);
    plain['paging.pageSize'] = String(query.paging.pageSize);
    if (query.paging.sortBy) plain['paging.sortBy'] = query.paging.sortBy;
    if (query.paging.sortDir) plain['paging.sortDir'] = query.paging.sortDir;
    if (query.bookStatus) plain['bookStatus'] = query.bookStatus;
    if (query.keyword) plain['keyword'] = query.keyword;
    if (query.categoryId != null) plain['categoryId'] = String(query.categoryId);
    if (query.saleTagIds && query.saleTagIds.length > 0) {
        plain['saleTagIds'] = query.saleTagIds.map(String);
    }
    if (query.minPrice != null) plain['minPrice'] = String(query.minPrice);
    if (query.maxPrice != null) plain['maxPrice'] = String(query.maxPrice);

    return plain;
}

/** BookListQuery → ParamMap */
// export function buildUrlFromQuery(query: BookListQuery): ParamMap {
//     const plain = buildPlainParams(query);
//     return convertToParamMap(plain);
// }

/** BookListQuery → HttpParams */
export function toHttpParams(query: BookListQuery): HttpParams {
    const fromObject = buildPlainParams(query);
    return new HttpParams({ fromObject });
}
