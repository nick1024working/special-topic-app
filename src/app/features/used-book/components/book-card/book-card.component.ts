import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookCard } from '../../models/book-card.mode';
import { Router } from '@angular/router';

@Component({
    selector: 'app-ub-book-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './book-card.component.html',
    styleUrl: './book-card.component.css'
})
export class BookCardComponent {
    private _bookCard: BookCard = FALLBACK_BOOK;

    @Input({ required: true })
    set bookCard(v: BookCard | null | undefined) {
        if (v) this._bookCard = v;          // 只有非 null 才用 fallback
    }
    get bookCard() { return this._bookCard; }

    constructor(private router: Router) { }

    goToBookDetail() {
        this.router.navigate([`used-book/books/${this.bookCard?.id}`]);
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
