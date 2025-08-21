import { convertToParamMap, ParamMap } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import {
    BookListQuery,
    DEFAULT_BOOK_LIST_QUERY,
    BOOK_STATUS,
    SORT_BY,
    SORT_DIR,
} from '../dtos/book-list-query.dto';

// 共用工具：白名單校驗
export function oneOf<T extends readonly string[]>(
    raw: string | null,
    list: T
): T[number] | undefined {
    return raw && (list as readonly string[]).includes(raw) ? (raw as T[number]) : undefined;
}

// 共用工具：字串 → number（非法或缺值回 undefined）
export function toNum(raw: string | null): number | undefined {
    if (raw == null) return undefined;
    const n = Number(raw);
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
        bookStatus: oneOf(q.get('bookStatus'), BOOK_STATUS),
        sortBy: oneOf(q.get('sortBy'), SORT_BY),
        sortDir: oneOf(q.get('sortDir'), SORT_DIR),
        keyword: q.get('keyword')?.trim() || undefined,
        minPrice: toNum(q.get('minPrice')),
        maxPrice: toNum(q.get('maxPrice')),

        categoryId: toNum(q.get('categoryId')),

        // page:     clamp(toNum(q.get('page')), 1),
        // pageSize: clamp(toNum(q.get('pageSize')), 1, 200),
    };

    const merged: BookListQuery = { ...DEFAULT_BOOK_LIST_QUERY, ...partial };

    // 邏輯矯正：價格上下限（min > max 時交換）
    if (merged.minPrice != null && merged.maxPrice != null && merged.minPrice > merged.maxPrice) {
        [merged.minPrice, merged.maxPrice] = [merged.maxPrice, merged.minPrice];
    }
    return merged;
}

/** BookListQuery → ParamMap */
export function buildUrlFromQuery(query: BookListQuery): ParamMap {
    const plain: Record<string, string> = {};

    if (query.bookStatus) plain['bookStatus'] = query.bookStatus;
    if (query.sortBy) plain['sortBy'] = query.sortBy;
    if (query.sortDir) plain['sortDir'] = query.sortDir;
    if (query.keyword) plain['keyword'] = query.keyword;
    if (query.minPrice != null) plain['minPrice'] = String(query.minPrice);
    if (query.maxPrice != null) plain['maxPrice'] = String(query.maxPrice);
    if (query.categoryId != null) plain['categoryId'] = String(query.categoryId);
    // if (query.page != null) plain['page'] = String(query.page);
    // if (query.pageSize != null) plain['pageSize'] = String(query.pageSize);

    return convertToParamMap(plain);
}

/** 把 BookListQuery 轉為 HttpParams（undefined 欄位會被忽略） */
export function toHttpParams(query: BookListQuery): HttpParams {
    const plain: Record<string, string | string[]> = {
        bookStatus: query.bookStatus,
        sortBy: query.sortBy,
        sortDir: query.sortDir,
    };
    if (query.keyword) plain['keyword'] = query.keyword;
    if (query.minPrice != null) plain['minPrice'] = String(query.minPrice);
    if (query.maxPrice != null) plain['maxPrice'] = String(query.maxPrice);
    // if (query.page != null)     plain['page']     = String(query.page);
    // if (query.pageSize != null) plain['pageSize'] = String(query.pageSize);

    return new HttpParams({ fromObject: plain });
}

/** 提供給 distinctUntilChanged 使用的簡單深比較（小物件足夠） */
export function shallowStableEqual(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}
