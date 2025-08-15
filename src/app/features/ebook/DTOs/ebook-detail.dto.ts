export interface EBookDetailDto {
    ebookId: number;
    ebookName: string;
    author: string;
    publisher: string;
    bookDescription: string;
    categoryName: string;
    labels: string[];
    primaryCoverPath: string;
    coverImages: string[] | null;   // 新增：封面圖片陣列
    imagePaths: string[];
}
