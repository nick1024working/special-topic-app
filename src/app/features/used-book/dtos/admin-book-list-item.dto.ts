import { IdNameDto } from "./id-name.dto";

export interface AdminBookListItemDto {
    /** 封面圖片URL */
    coverImageUrl: string;

    /** 書本編號 */
    id: string; // Guid 在 TS 裡用 string

    /** 書名 */
    title: string;

    /** 賣家編號 */
    sellerId: string; // Guid -> string

    /** 售價 */
    salePrice: number;

    /** 上架 */
    isOnShelf: boolean;

    /** 啟用 */
    isActive: boolean;

    /** 售出 */
    isSold: boolean;

    /** 網址 */
    slug: string;

    /** 更新時間 */
    updatedAt: string; // 如果要處理成 Date 可改成 Date

    /** 建立時間 */
    createdAt: string;

    saleTagList: IdNameDto[];
}
