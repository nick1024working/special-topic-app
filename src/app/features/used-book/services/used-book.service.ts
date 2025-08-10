import { Injectable } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PublicBookListItemDto } from '../dtos/public-book-list-item.dto';
import { BookListQuery } from '../dtos/book-list-query.dto';

@Injectable({
    providedIn: 'root'
})
export class UsedBookService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/books`;

    constructor(private http: HttpClient) { }

    getPublicBookList(query: BookListQuery): Observable<PublicBookListItemDto[]> {
        const params = this.toHttpParams(query);
        return this.http.get<PublicBookListItemDto[]>(`${this.baseUrl}?${params}`);
    }

    /*
    getPublicDetail(id: number): Observable<PublicBookDetailDto> {
        return this.http.get<PublicBookDetailDto>(`${this.baseUrl}/${id}`).pipe(
        // 順便確保 imageList 陣列存在
        map(d => ({ ...d, imageList: d.imageList ?? [] }))
        );
    }
    */

    // creatBook(): {}

    // deleteBook(): {}


    private toHttpParams(q: BookListQuery): HttpParams {
        let p = new HttpParams();
        Object.entries(q).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                p = p.set(k.charAt(0).toLowerCase() + k.slice(1), String(v));
            }
        });
        return p;
    }
}
