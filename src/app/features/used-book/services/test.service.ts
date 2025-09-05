import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class TestService {
    private readonly baseUrl = `${environment.apiBaseUrl}/api/usedbooks/test`;
    private readonly http = inject(HttpClient);

    public setCookie(): Observable<null> {
        return this.http.get<null>(`${this.baseUrl}`);
    }
}
