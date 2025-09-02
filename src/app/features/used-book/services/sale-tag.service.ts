import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { CreateSaleTagRequestDto } from '../dtos/create-sale-tag-request.dto';
import { Observable } from 'rxjs';
import { BookSaleTagDto } from '../dtos/book-sale-tag.dto';
import { UpdatePartialBookSaleTagRequestDto } from '../dtos/update-partial-book-sale-tag-request.dto';
import { UpdateOrderByIdRequestDto } from '../dtos/update-order-by-id-request.dto';

@Injectable({
    providedIn: 'root'
})
export class SaleTagService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/sale-tags`;

    constructor(private http: HttpClient) { }

    createSaleTag(req: CreateSaleTagRequestDto): Observable<number> {
        return this.http.post<number>(`${this.baseUrl}`, req);
    }

    deleteSaleTag(id: number): Observable<null> {
        return this.http.delete<null>(`${this.baseUrl}/${id}`);
    }

    updateSaleTag(id: number, req: UpdatePartialBookSaleTagRequestDto): Observable<null> {
        return this.http.patch<null>(`${this.baseUrl}/${id}`, req);
    }

    updateAllSaleTagsOrder(req: UpdateOrderByIdRequestDto): Observable<null> {
        return this.http.put<null>(`${this.baseUrl}/order`, req);
    }

    getSaleTag(id: number): Observable<BookSaleTagDto> {
        return this.http.get<BookSaleTagDto>(`${this.baseUrl}/${id}`);
    }

    getAllSaleTags(): Observable<BookSaleTagDto[]> {
        return this.http.get<BookSaleTagDto[]>(`${this.baseUrl}`);
    }
}
