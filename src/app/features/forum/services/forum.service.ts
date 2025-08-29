import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Category { id: number; name: string; }
export interface ForumComment {
  commentId: number; authorName: string; createdAt: string; content: string;
}
export interface ForumPostListItem {
  postId: number;
  title: string;
  authorName: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  replyCount?: number;
  excerpt?: string;
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
export interface ForumListItem {
  postId: number;
  title: string;
  boardId?: number;
  boardName?: string;
  authorName: string;
  createdAt: string; // ISO
  replyCount: number;
  viewCount: number;
  excerpt?: string;
  avatarUrl?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;       // 總筆數
  totalPages: number;  // 總頁數
}
@Injectable({ providedIn: 'root' })
export class ForumService {

getPostList(params: { page?: number; pageSize?: number; boardId?: number; orderBy?: string; })
  : Observable<PagedResult<ForumListItem>> {

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;

  return this.http.get<any>(`${this.base}/api/forum/posts`, {
    params: {
      page,
      pageSize,
      boardId: params.boardId ?? '',
      orderBy: params.orderBy ?? 'new'   // new / hot ... 視後端規格
    }
  }).pipe(
    map(res => {
      // 後端欄位大小寫容錯 + 映射
      const list = (res.items ?? res.Items ?? res.data ?? []).map((x: any) => <ForumListItem>{
        postId: x.postId ?? x.PostID ?? x.id,
        title: x.title ?? x.Title ?? '',
        boardId: x.boardId ?? x.BoardID,
        boardName: x.boardName ?? x.BoardName ?? '',
        authorName: x.authorName ?? x.AuthorName ?? '',
        createdAt: (x.createdAt ?? x.CreatedAt ?? new Date()).toString(),
        replyCount: x.replyCount ?? x.ReplyCount ?? 0,
        viewCount: x.viewCount ?? x.ViewCount ?? 0,
        excerpt: x.excerpt ?? x.Excerpt ?? x.summary ?? '',
        avatarUrl: x.avatarUrl ?? x.AvatarUrl ?? ''
      });

      const total = res.total ?? res.Total ?? list.length;
      const pgSize = res.pageSize ?? res.PageSize ?? pageSize;
      const pg = res.page ?? res.Page ?? page;
      const totalPages = res.totalPages ?? Math.max(1, Math.ceil(total / pgSize));

      return <PagedResult<ForumListItem>>({ items: list, page: pg, pageSize: pgSize, total, totalPages });
    }),
    catchError(err => {
      console.error('[getPostList] error:', err);
      return of({ items: [], page, pageSize, total: 0, totalPages: 1 });
    })
  );
}
  getPostsByCategory(categoryId: number, page = 1, pageSize = 20): Observable<ForumPostListItem[]> {
    return this.http
      .get<any>(`${this.base}/api/forum/posts/by-category/${categoryId}`, {
        params: { page, pageSize }
      })
      .pipe(
        map(res => (res?.Items ?? res?.items ?? [])),
        catchError(err => {
          console.error('[getPostsByCategory] error:', err);
          return of([]);
        })
      );
  }

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
  getPosts(page = 1, pageSize = 20, boardId?: number, orderBy: 'new'|'hot'='new'): Observable<ForumPostListItem[]> {
    const params: any = { page, pageSize, orderBy };
    if (boardId) params.boardId = boardId;

    return this.http.get<any>(`${this.base}/api/forum/posts`, { params }).pipe(
      map(res => (res?.Items ?? res?.items ?? [])),
      catchError(err => {
        console.error('[getPosts] error:', err);
        return of([]);
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
