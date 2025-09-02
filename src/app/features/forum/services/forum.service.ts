import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
export interface PostListResponse {
  items: any[];
  totalCount: number;
}
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  /** 統一 API base：避免混用 / 重複拼接 */
  private api = `${environment.apiBaseUrl}/api/forum`;
  private readonly baseUrl = 'https://localhost:7104';
  constructor(private http: HttpClient) {}

  // ====== 共用小工具 ======
  /** 把 new/hot/viewed 映射成後端的 orderBy 值（可依後端調整） */
private mapSortToOrderBy(sort: 'new'|'hot'|'view' = 'new'): string {
  if (sort === 'hot') return 'hot';
  if (sort === 'view') return 'view';
  return 'new';
}

  // ====== 類別 ======
  getCategories(): Observable<Category[]> {
    return this.http.get<any[]>(`${this.api}/categories`).pipe(
      map(list => (list ?? []).map(x => ({
        id: x.PostCategoryID ?? x.id ?? x.categoryId ?? 0,
        name: x.PostCategoryName ?? x.name ?? x.categoryName ?? ''
      } as Category))),
      catchError(err => { console.error('[getCategories] error:', err); return of([]); })
    );
  }

  // ====== 文章清單（全站） ======
  getPostList(params: { page?: number; pageSize?: number; boardId?: number; orderBy?: string; })
    : Observable<PagedResult<ForumListItem>> {

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;

    const httpParams = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('boardId', (params.boardId ?? '').toString())
      .set('orderBy', params.orderBy ?? 'new');

    return this.http.get<any>(`${this.api}/posts`, { params: httpParams }).pipe(
      map(res => {
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

  /** 舊的 getPosts，保留但也把 orderBy 帶進去 */
  getPosts(page = 1, pageSize = 20, boardId?: number, orderBy: 'new'|'hot'|'view'='new'): Observable<ForumPostListItem[]> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize).set('orderBy', orderBy);
    if (boardId) params = params.set('boardId', boardId);

    return this.http.get<any>(`${this.api}/posts`, { params }).pipe(
      map(res => (res?.items ?? res?.Items ?? [])),
      catchError(err => {
        console.error('[getPosts] error:', err);
        return of([]);
      })
    );
  }
deletePost(id: number) {
  return this.http.delete<void>(`${this.baseUrl}/api/forum/posts/${id}`);
}

updatePost(id: number, payload: { title?: string; contentHtml?: string; postCategoryID?: number; }) {
  return this.http.put<void>(`${this.baseUrl}/api/forum/posts/${id}`, payload);
}
  // ====== 文章清單（依分類）— 這是你列表頁在用的 ======
  getPostsByCategory(
  categoryId: number,
  page = 1,
  pageSize = 20,
  sort: 'new'|'hot'|'view' = 'new'
): Observable<PostListResponse> {
  const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('orderBy', this.mapSortToOrderBy(sort));

  return this.http.get<any>(`${this.api}/posts/by-category/${categoryId}`, { params }).pipe(
    map(res => ({
      items: (res?.items ?? res?.Items ?? res?.data ?? []) as any[],
      totalCount: res?.totalCount ?? res?.total ?? res?.Total ?? (res?.items?.length ?? 0)
    }) as PostListResponse),
    catchError(err => {
      console.error('[getPostsByCategory] error:', err);
      return of({ items: [], totalCount: 0 });
    })
  );
}
  // ====== 單篇、留言 ======
  getPost(id: number): Observable<ForumPostVm> {
    return this.http.get<any>(`${this.api}/posts/${id}`).pipe(
      map(raw => this.mapPost(raw)),
      catchError(err => {
        console.error('[getPost] error:', err);
        return of({
          postId: id, title: '(讀取失敗)', authorName: '', createdAt: new Date().toISOString(),
          viewCount: 0, likeCount: 0, contentHtml: '', images: []
        } as ForumPostVm);
      })
    );
  }

  getComments(postId: number): Observable<ForumComment[]> {
    return this.http.get<any[]>(`${this.api}/posts/${postId}/comments`).pipe(
      map(list => (list ?? []).map(c => ({
        commentId: c.CommentID ?? c.commentId ?? c.id ?? 0,
        authorName: c.AuthorName ?? c.authorName ?? '',
        createdAt: (c.CreatedAt ?? c.createdAt ?? new Date()).toString(),
        content: c.Content ?? c.content ?? ''
      } as ForumComment))),
      catchError(err => { console.error('[getComments] error:', err); return of([]); })
    );
  }

  createPost(fd: FormData): Observable<number> {
    return this.http.post<number>(`${this.api}/posts`, fd);
  }

  // ---------- helpers ----------
  private mapPost(p: any): ForumPostVm {
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
    const base = environment.apiBaseUrl.replace(/\/+$/,'');
    if (path.startsWith('/')) return `${base}${path}`;
    return `${base}/${path}`;
  }
}
