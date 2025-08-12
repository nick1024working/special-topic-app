export interface ImageItemDto {
    id: number;
    storageProvider: number; // 1 = Local
    objectKey: string;
    // 預留給前端解析後填入（不從 API 回來）
    mainUrl?: string;
    thumbUrl?: string;
}
