import { Component, inject, Input } from '@angular/core';
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
    private readonly _router = inject(Router);

    private _bookCard: BookCard = FALLBACK_BOOK;

    @Input({ required: true })
    set bookCard(v: BookCard | null | undefined) {
        if (v)
            this._bookCard = v;          // 只有非 null 才用 fallback
    }
    get bookCard() { return this._bookCard; }

    goToBookDetail() {
        this._router
            .navigate([`/used-book/books/${this.bookCard?.id}`])
            .then(() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            });
    }

    getColor(rating: string): string {
        switch (rating) {
            case '近全新':
                return '#FFA559';
            case '優良':
                return '#6FCF97';
            case '良好':
                return '#56CCF2';
            case '可接受':
                return '#ad988eff';
            case '差':
                return '#8D99AE';
        }
        return '#8D99AE';
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
