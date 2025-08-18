// import { ImageDto } from './models';
// 共用分頁
export interface PagedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

/** 前端畫面用的專案型別（沿用你原本模板欄位） */
export interface FundProject {
    id: number;
    projectTitle: string;
    projectDescription?: string | null;
    projectLongDescription?: string | null;
    currentAmount: number;
    targetAmount: number;
    startDate: string; // ISO
    endDate: string;   // ISO
    backerCount: number;
    status: '募資中' | '已下架' | '已結束' | string;
    mainImagePath?: string | null;
    gallery?: string[] | null;
    isFavorite?: boolean | null;
    donateCategoriesId?: number | null;
}

/** 分類（配合你的 template：c.name / c.id） */
export interface FundCategory {
    id: number;
    name: string;
}

/** 後端 API DTO：List */
export interface ProjectListDto {
    donateProjectId: number;
    projectTitle: string;
    projectDescription?: string | null;
    targetAmount: number;
    currentAmount: number;
    backerCount: number;
    startDate: string; // 後端已輸出 ISO 時間字串
    endDate: string;
    projectLongDescription?: string | null;
    status: string;
    mainImagePath?: string | null;
    isFavorite: boolean;
}

export interface ProjectCreateDto {
    donateCategoriesId: number;     // 分類 Id
    uid: string;                    // 建立者 UID (Guid)
    projectTitle: string;           // 專案標題
    projectDescription?: string | null;
    targetAmount: number;
    /** ISO 日期字串，如 '2025-08-13T00:00:00' 或 '2025-08-13' */
    startDate: string;
    endDate: string;
    projectLongDescription?: string | null;
    isFavorite?: boolean | null;

    /** 可選：若同時想直接指定主圖/相簿（通常我們改用上傳 API） */
    mainImagePath?: string | null;
    gallery?: string[] | null;
}

/** 後端 API DTO：Detail（比 List 多 longDescription / gallery） */
export interface ProjectDetailDto extends ProjectListDto {
    longDescription?: string | null;
    gallery?: string[] | null;
}

/** 後端 API DTO：Category */
export interface CategoryDto {
    donateCategoriesId: number;
    categoriesName: string;
}

export type ProjectUpdateDto = ProjectCreateDto;

/** 後端 API：圖片資料 DTO（讀/寫皆會用到） */
export interface ImageDto {
    donateImageId: number;
    donateProjectId: number;
    donateImagePath?: string | null;     // 主圖路徑（相對，如 'FundImages/123/xxx.jpg'）
    isMain?: boolean | null;             // 是否主圖
    projectGalleryPath?: string | null;  // 相簿路徑（非主圖）
}

/** 前端畫面用的方案型別 */
export interface FundPlan {
    id: number;
    projectId: number;
    title: string;
    price: number;
    description?: string | null;
    imagePath?: string | null; // 若後端沒圖就留空，前端顯示預設圖
}

/** 後端 DTO（欄位名依你的資料表命名） */
export interface PlanDto {
    donatePlanId: number;
    donateProjectId: number;
    planTitle: string;
    price: number;
    planDescription?: string | null;
    planImagePath?: string | null; // 你的資料表目前沒有圖片欄位，先標可選
}

