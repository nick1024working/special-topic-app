export function pageWindow(nowPos: number, total: number, width: number = DEFAULT_PAGING_WIDTH): number[] {
    if (total <= 0) return [];

    nowPos = Math.max(1, Math.min(nowPos, total));
    width = Math.max(1, Math.min(width, total));

    const half = Math.floor(width / 2);
    const start = Math.max(1, nowPos - half);
    const end = Math.min(total, start + width - 1);

    const result: number[] = [];
    for (let i = start; i <= end; ++i)
        result.push(i);
    return result;
};

export const DEFAULT_PAGING_WIDTH: number = 5;
