import { Component } from '@angular/core';
import { PublicBookDetailComponent } from "../../components/public-book-detail/public-book-detail.component";
import { BookRowComponent } from "../../components/book-row/book-row.component";

@Component({
    selector: 'app-ub-public-book-detail-page',
    standalone: true,
    imports: [PublicBookDetailComponent, BookRowComponent],
    templateUrl: './public-book-detail-page.component.html',
    styleUrl: './public-book-detail-page.component.css'
})
export class PublicBookDetailPageComponent {

}
