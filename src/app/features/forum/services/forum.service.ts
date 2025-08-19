import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// TODO: 改成你的 WebAPI
const API_BASE = 'https://localhost:7104/api';

export interface CreatePostDto {
  title: string;
  contentHtml: string;  // 若你傳 Markdown，就改成 contentMarkdown
  postCategoryID: number;
  postFilterID: number;
  uid: string;          // 從登入拿的 UID（之後你會從會員系統帶進來）
}

export interface CreatedPostResult {
  postID: number;
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);

  createPost(dto: CreatePostDto): Observable<CreatedPostResult> {
    return this.http.post<CreatedPostResult>(`${API_BASE}/ForumPosts`, dto);
  }

  uploadPostImages(postID: number, files: File[], mainIndex: number | null): Observable<void> {
    const form = new FormData();
    files.forEach((f, i) => form.append('files', f, f.name));
    if (mainIndex !== null && mainIndex >= 0) form.append('mainIndex', String(mainIndex));
    // 依你後端的 Image 上傳端點命名：
    return this.http.post<void>(`${API_BASE}/PostImages/upload/${postID}`, form);
  }
}
