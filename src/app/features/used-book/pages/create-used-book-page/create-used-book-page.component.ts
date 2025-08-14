import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdNameDto } from '../../dtos/id-name.dto';
import { LookupService } from '../../services/lookup.service';
import { ImageUploaderComponent } from "../../components/image-uploader/image-uploader.component";
import { NewImageUploaderComponent } from "../../components/new-image-uploader/new-image-uploader.component";

@Component({
    selector: 'app-ub-create-used-book-page',
    standalone: true,
    imports: [
    NgFor,
    FormsModule,
    ImageUploaderComponent,
    NewImageUploaderComponent
],
    templateUrl: './create-used-book-page.component.html',
    styleUrl: './create-used-book-page.component.css',
})
export class CreateUsedBookPageComponent {

    bookBindings: IdNameDto[] = [];
    bookConditionRatings: IdNameDto[] = [];
    contentRatings: IdNameDto[] = [];
    counties: IdNameDto[] = [];
    languages: IdNameDto[] = [];
    districts: IdNameDto[] = []; // 建議根據選縣市動態更新

    form: BookForm = {
        title: '',
        authors: '',
        salePrice: 0,
        conditionRatingId: null,
        conditionDescription: '',
        publisher: '',
        publicationDate: (new Date()).toISOString().substring(0, 10),
        isbn: '',
        pages: null,
        edition: '',
        bindingId: null,
        languageId: null,
        contentRatingId: null,
        isOnShelf: false,
        sellerCountyId: null,
        sellerDistrictId: null
    };

    bookCondDesc: string = '請先選擇書況評等';
    hasError: boolean = false;

    constructor(private lookupService: LookupService) { }

    ngOnInit(): void {

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

    fillCondDesc(): void {
        if (!this.form.conditionRatingId)
            return;

        this.lookupService.GetBookConditionRatingDescriptionById(this.form.conditionRatingId).subscribe({
            next: (res) => {
                this.bookCondDesc = res.description;
                console.log(this.bookCondDesc);
            },
            error: (err) => console.error('取得書況說明失敗', err),
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

    imageList: File[] = [];
    onImagesChanged(files: File[]) {
        this.imageList = files;
    }

    onSubmit(): void {

    }
}

interface BookForm {
    title: string;
    authors: string;
    salePrice: number;
    conditionRatingId: number | null;
    conditionDescription: string;
    publisher: string;
    publicationDate: string;
    isbn: string;
    pages: number | null;
    edition: string;
    bindingId: number | null;
    languageId: number | null;
    contentRatingId: number | null;
    isOnShelf: boolean;
    sellerCountyId: number | null;
    sellerDistrictId: number | null;
}
