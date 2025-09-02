import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { UpdateOrderByIdRequestDto } from '../dtos/update-order-by-id-request.dto';
import { BookCategoryDto } from '../dtos/book-category.dto';
import { CreateCategoryRequestDto } from '../dtos/create-category-request.dto';
import { UpdatePartialBookCategoryRequestDto } from '../dtos/update-partial-book-category-request.dto';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/categories`;

    constructor(private http: HttpClient) { }

    createCategory(req: CreateCategoryRequestDto): Observable<number> {
        return this.http.post<number>(`${this.baseUrl}`, req);
    }

    deleteCategory(id: number): Observable<null> {
        return this.http.delete<null>(`${this.baseUrl}/${id}`);
    }

    updateCategory(id: number, req: UpdatePartialBookCategoryRequestDto): Observable<null> {
        return this.http.patch<null>(`${this.baseUrl}/${id}`, req);
    }

    updateAllCategoriesOrder(req: UpdateOrderByIdRequestDto): Observable<null> {
        return this.http.put<null>(`${this.baseUrl}/order`, req);
    }

    getCategory(id: number): Observable<BookCategoryDto> {
        return this.http.get<BookCategoryDto>(`${this.baseUrl}/${id}`);
    }

    getAllCategories(): Observable<BookCategoryDto[]> {
        return this.http.get<BookCategoryDto[]>(`${this.baseUrl}`);
    }
}
