import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookCard } from '../../models/book-card.mode';

@Component({
    selector: 'app-ub-book-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './book-card.component.html',
    styleUrl: './book-card.component.css'
})
export class BookCardComponent {
    @Input() bookCard!: BookCard;

    ngOnInit(): void {
        this.bookCard = FALLBACK_BOOK;
    }

    onAddCart() {

    }
}

const FALLBACK_BOOK: BookCard = {
    coverImageUrl: 'assets/images/used-book/fallback-thumb.jpg',
    saleTagList: [],
    id: '0000',
    title: '不存在的書',
    authors: '無名氏',
    salePrice: 9900,
    conditionRating: '不存在',
    slug: 'error-page'
};
