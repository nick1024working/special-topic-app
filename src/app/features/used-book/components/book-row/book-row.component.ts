import { Component, inject, Input } from '@angular/core';
import { BookCardComponent } from "../book-card/book-card.component";
import { UsedBookService } from '../../services/used-book.service';
import { BookCard } from '../../models/book-card.model';

@Component({
    selector: 'app-ub-book-row',
    standalone: true,
    imports: [BookCardComponent],
    templateUrl: './book-row.component.html',
    styleUrl: './book-row.component.css'
})
export class BookRowComponent {
    private readonly _svc = inject(UsedBookService);

    @Input() title: string = "";
    @Input() bookCardList: BookCard[] = [];
    @Input() moreLink: string = "/";
}
