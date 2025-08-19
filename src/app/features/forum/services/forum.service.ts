import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Category { id: number; name: string; }
export interface ForumComment {
  commentId: number; authorName: string; createdAt: string; content: string;
}
export interface ForumPostVm {
  postId: number;
  title: string;
  authorName: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  contentHtml: string;
  images: string[];
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getPost(id: number): Observable<ForumPostVm> {
    return this.http.get<any>(`${this.base}/api/forum/posts/${id}`).pipe(
      map(raw => this.mapPost(raw)),
      catchError(err => {
        console.error('[getPost] error:', err);
        // 回傳空殼，避免畫面炸掉
        return of({
          postId: id, title: '(讀取失敗)', authorName: '', createdAt: new Date().toISOString(),
          viewCount: 0, likeCount: 0, contentHtml: '', images: []
        } as ForumPostVm);
      })
    );
  }

  getComments(postId: number): Observable<ForumComment[]> {
    return this.http.get<any[]>(`${this.base}/api/forum/posts/${postId}/comments`).pipe(
      map(list => (list ?? []).map(c => ({
        commentId: c.CommentID ?? c.commentId ?? c.id ?? 0,
        authorName: c.AuthorName ?? c.authorName ?? '',
        createdAt: (c.CreatedAt ?? c.createdAt ?? new Date()).toString(),
        content: c.Content ?? c.content ?? ''
      } as ForumComment))),
      catchError(err => { console.error('[getComments] error:', err); return of([]); })
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<any[]>(`${this.base}/api/forum/categories`).pipe(
      map(list => (list ?? []).map(x => ({
        id: x.PostCategoryID ?? x.id ?? x.categoryId ?? 0,
        name: x.PostCategoryName ?? x.name ?? x.categoryName ?? ''
      } as Category))),
      catchError(err => { console.error('[getCategories] error:', err); return of([]); })
    );
  }

  createPost(fd: FormData): Observable<number> {
    return this.http.post<number>(`${this.base}/api/forum/posts`, fd);
  }

  // ---------- helpers ----------
  private mapPost(p: any): ForumPostVm {
    // 後端可能回：PascalCase + 內含 Images[] 物件或字串陣列
    const imgs: string[] = Array.isArray(p?.Images)
      ? p.Images.map((it: any) => this.toUrl(it.ImagePath ?? it.path ?? it))
      : Array.isArray(p?.images)
        ? p.images.map((it: any) => this.toUrl(it.ImagePath ?? it.path ?? it))
        : [];

    return {
      postId: p.PostID ?? p.postId ?? p.id ?? 0,
      title: p.Title ?? p.title ?? '',
      authorName: p.AuthorName ?? p.authorName ?? p.Author ?? '',
      createdAt: (p.CreatedAt ?? p.createdAt ?? new Date()).toString(),
      viewCount: p.ViewCount ?? p.viewCount ?? 0,
      likeCount: p.LikeCount ?? p.likeCount ?? 0,
      contentHtml: p.ContentHtml ?? p.contentHtml ?? p.Content ?? '',
      images: imgs
    };
  }

  /** 相對路徑補 host；已是 http(s) 則原樣 */
  private toUrl(path: string): string {
    if (!path) return path;
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith('/')) return `${this.base}${path}`;
    return `${this.base}/${path}`;
  }
}
