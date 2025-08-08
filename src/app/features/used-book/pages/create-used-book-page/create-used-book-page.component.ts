import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdNameDto } from '../../dtos/id-name.dto';
import { LookupServiceTsService } from '../../services/lookup.service.ts.service';

@Component({
  selector: 'app-create-used-book-page',
  standalone: true,
  imports: [
    NgFor,
    FormsModule,
  ],
    templateUrl: './create-used-book-page.component.html',
    styleUrl: './create-used-book-page.component.css'
})
export class CreateUsedBookPageComponent {

    bookBindings: IdNameDto[] = [];
    bookConditionRatings: IdNameDto[] = [];
    contentRatings: IdNameDto[] = [];
    counties: IdNameDto[] = [];
    languages: IdNameDto[] = [];
    districts: IdNameDto[] = []; // 建議根據選縣市動態更新

    hasError: boolean = false;

    form: BookForm = {
        title: '',
        authors: '',
        salePrice: 0,
        conditionRatingId: '',
        conditionDescription: '',
        publisher: '',
        publicationDate: new Date(),
        isbn: '',
        pages: '',
        edition: '',
        bindingId: '',
        languageId: '',
        contentRatingId: '',
        isOnShelf: false,
        sellerCountyId: null,
        sellerDistrictId: null
    };


    constructor(private lookupService: LookupServiceTsService) { }

    ngOnInit(): void {
        // 只是測試用
        this.lookupService.GetCountyList().subscribe({
            next: (res) => console.log(res),
            error: (err) => console.error('取得縣市清單失敗', err),
        });


        this.lookupService.GetAllUsedBookUILookupsList().subscribe({
            next: (res) => {
                this.bookBindings = res.bookBindings;
                console.log(this.bookBindings),
                this.bookConditionRatings = res.bookConditionRatings;
                this.contentRatings = res.contentRatings;
                this.counties = res.counties;
                this.languages = res.languages;
            },
            error: (err) => console.error('取得縣市清單失敗', err),
        });
    }

    fillDIstricts(): void {
        if (!this.form.sellerCountyId)
            return;

        this.lookupService.GetDistrictListByCountyId(this.form.sellerCountyId).subscribe({
            next: (res) => {
                this.districts = res;
            },
            error: (err) => console.error('取得鄉鎮市區清單失敗', err),
        });
    }

    onSubmit(): void {

    }
}

interface BookForm {
    title: string;
    authors: string;
    salePrice: number;
    conditionRatingId: string;
    conditionDescription: string;
    publisher: string;
    publicationDate: Date;
    isbn: string;
    pages: string;
    edition: string;
    bindingId: string;
    languageId: string;
    contentRatingId: string;
    isOnShelf: boolean;
    sellerCountyId: number | null;
    sellerDistrictId: number | null;
}
