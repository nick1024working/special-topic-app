import { Component } from '@angular/core';
import { BookRowComponent } from "../../components/book-row/book-row.component";
import { RouterLink } from '@angular/router';

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

}
