import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IdNameDto } from '../dtos/id-name.dto';
import { environment } from '@env/environment';
import { BookConditionRatingDescriptionDto } from '../dtos/book-condition-rating-description.dto';
import { AllUsedBookLookupListsDto } from '../dtos/all-used-book-lookup-lists.dto';

@Injectable({
    providedIn: 'root'
})
export class LookupServiceTsService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/lookup`;

    constructor(private http: HttpClient) { }

    GetCountyList(): Observable<IdNameDto[]> {
        return this.http.get<IdNameDto[]>(`${this.baseUrl}/counties`);
    }

    GetDistrictListByCountyId(countyId: number): Observable<IdNameDto[]> {
        return this.http.get<IdNameDto[]>(`${this.baseUrl}/counties/${countyId}/districts`);
    }

    GetLanguageList(): Observable<IdNameDto[]> {
        return this.http.get<IdNameDto[]>(`${this.baseUrl}/languages`);
    }

    GetBookConditionRatingDescriptionById(id: number): Observable<BookConditionRatingDescriptionDto> {
        return this.http.get<BookConditionRatingDescriptionDto>(`${this.baseUrl}/usedbooks/condition-rating-desc/${id}`);
    }

    GetAllUsedBookUILookupsList(): Observable<AllUsedBookLookupListsDto> {
        return this.http.get<AllUsedBookLookupListsDto>(`${this.baseUrl}/usedbooks/all-ui-lookups`);
    }
}
