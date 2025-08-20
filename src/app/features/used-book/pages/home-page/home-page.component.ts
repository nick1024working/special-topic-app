import { Component, inject, signal } from '@angular/core';
import { BookRowComponent } from "../../components/book-row/book-row.component";
import { RouterLink } from '@angular/router';
import { IdNameDto } from '../../dtos/id-name.dto';
import { LookupService } from '../../services/lookup.service';

@Component({
    selector: 'app-ub-home-page',
    standalone: true,
    imports: [BookRowComponent, RouterLink],
    templateUrl: './home-page.component.html',
    styleUrls: [
        './home-page.component.css',
        '../../styles/bs-custom-override.scss',
    ],
})
export class HomePageComponent {
    private readonly _lookupSvc = inject(LookupService);

    categoryList = signal<IdNameDto[]>([]);
    saleTagList = signal<IdNameDto[]>([]);

    ngOnInit(): void {
        this._lookupSvc.GetBookCategoryList().subscribe({
            next: (res) => this.categoryList.set(res),
            error: (err) => console.error("[ngOnInit]讀取分類清單錯誤", err)
        });
        this._lookupSvc.GetSaleTagList().subscribe({
            next: (res) => this.saleTagList.set(res),
            error: (err) => console.error("[ngOnInit]讀取分類清單錯誤", err)
        });
    }


}
