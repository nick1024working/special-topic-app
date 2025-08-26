export const PROVIDERS = ['EBook', 'Fund', 'UsedBook'] as const;
export type ProductProvider = typeof PROVIDERS[number];

// ProductProvider to 顯示文字
export function providerToRepr(p: ProductProvider): string {
    return ProviderRepr[p];
}
export const ProviderRepr: Record<ProductProvider, string> = {
    EBook: '電子書',
    Fund: '募資',
    UsedBook: '二手書',
};

// ProductProvider to 後端對應的 enum value
export function providerToValue(p: ProductProvider): number {
    return ProviderValueMap[p];
}
export const ProviderValueMap: Record<ProductProvider, number> = {
    EBook: 0,
    Fund: 1,
    UsedBook: 2,
};

// 型別安全的 Object.entries 版本
export function typedEntries<T extends Record<string, unknown>>(obj: T) {
    return Object.entries(obj) as { [K in keyof T]: [K, T[K]] }[keyof T][];
}


// 字串 to ProductProvider 解析
export function parseProvider(x: string): ProductProvider | undefined {
    return (PROVIDERS as readonly string[]).includes(x) ? (x as ProductProvider) : undefined;
}
