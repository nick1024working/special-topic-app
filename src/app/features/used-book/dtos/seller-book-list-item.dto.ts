export interface SellerBookListItemDto {
    /** 封面圖片URL */
    coverImageUrl: string;

    /** 書本編號 */
    id: string; // Guid -> string

    /** 書名 */
    title: string;

    /** 售價 */
    salePrice: number; // decimal -> number

    /** 上架 */
    isOnShelf: boolean;

    /** 售出 */
    isSold: boolean;

    /** 網址 */
    slug: string;

    /** 建立時間 */
    createdAt: string; // DateTime -> string (或 Date)

    /** 更新時間 */
    updatedAt: string; // DateTime -> string (或 Date)
}
