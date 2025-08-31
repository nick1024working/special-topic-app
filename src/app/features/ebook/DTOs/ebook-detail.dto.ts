export interface EBookDetailDto {
    ebookId: number;
    ebookName: string;
    author: string;
    publisher: string;
    bookDescription: string;
    fixedPrice: number;         // [新增] 補上原 DTO 就有的欄位
    actualPrice?: number;       // [新增] 補上原 DTO 就有的欄位
    categoryName: string;
    labels: string[];
    primaryCoverPath: string;
    coverImages: string[] | null;   // 新增：封面圖片陣列
    imagePaths: string[];


    // [新增] 加入後端擴充的詳細資料欄位
    isbn?: string;
    eisbn?: string;
    publishedDate?: string; // DateOnly 通常會序列化成 YYYY-MM-DD 的字串
    language?: string;
    translator?: string;
    ebookDataType?: string;
    totalSales: number; // [新增] 加入總銷量欄位
}
