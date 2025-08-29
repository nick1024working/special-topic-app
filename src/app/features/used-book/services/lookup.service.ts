import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { IdNameDto } from '../dtos/id-name.dto';
import { BookConditionRatingDescriptionDto } from '../dtos/book-condition-rating-description.dto';
import { AllUsedBookLookupListsDto } from '../dtos/all-used-book-lookup-lists.dto';

@Injectable({
    providedIn: 'root'
})
export class LookupService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/lookup`;

    constructor(private http: HttpClient) { }

    getCountyById(countyId: number): Observable<IdNameDto> {
        return this.http.get<IdNameDto>(`${this.baseUrl}/counties/${countyId}`);
    }

    getDistrictById(districtId: number): Observable<IdNameDto> {
        return this.http.get<IdNameDto>(`${this.baseUrl}/districts/${districtId}`);
    }

    getCountyList(): Observable<IdNameDto[]> {
        return this.http.get<IdNameDto[]>(`${this.baseUrl}/counties`);
    }

    getDistrictListByCountyId(countyId: number): Observable<IdNameDto[]> {
        return this.http.get<IdNameDto[]>(`${this.baseUrl}/counties/${countyId}/districts`);
    }

    getLanguageList(): Observable<IdNameDto[]> {
        return this.http.get<IdNameDto[]>(`${this.baseUrl}/languages`);
    }

    getBookCategoryList(): Observable<IdNameDto[]> {
        return this.http.get<IdNameDto[]>(`${this.baseUrl}/categories`);
    }

    getSaleTagList(): Observable<IdNameDto[]> {
        return this.http.get<IdNameDto[]>(`${this.baseUrl}/sale-tags`);
    }

    getBookConditionRatingDescriptionById(id: number): Observable<BookConditionRatingDescriptionDto> {
        return this.http.get<BookConditionRatingDescriptionDto>(`${this.baseUrl}/usedbooks/condition-rating-desc/${id}`);
    }

    getAllUsedBookUILookupsList(): Observable<AllUsedBookLookupListsDto> {
        return this.http.get<AllUsedBookLookupListsDto>(`${this.baseUrl}/usedbooks/all-ui-lookups`);
    }
}
