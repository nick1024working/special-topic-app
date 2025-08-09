export interface EBookDetailDto {
    ebookId: number;
    ebookName: string;
    author: string;
    publisher: string;
    bookDescription: string;
    categoryName: string;
    labels: string[];
    primaryCoverPath: string;
    imagePaths: string[];
}