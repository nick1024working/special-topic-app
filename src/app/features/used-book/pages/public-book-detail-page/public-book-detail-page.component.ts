import { catchError, EMPTY, map, take } from 'rxjs';
import { Component, inject, signal } from '@angular/core';
import { PublicBookDetailComponent } from "../../components/public-book-detail/public-book-detail.component";
import { BookRowComponent } from "../../components/book-row/book-row.component";
import { BookListQuery } from '../../dtos/book-list-query.dto';
import { UsedBookService } from '../../services/used-book.service';
import { BookCard } from '../../models/book-card.model';
import { PublicBookListItemDto } from '../../dtos/public-book-list-item.dto';

@Component({
    selector: 'app-ub-public-book-detail-page',
    standalone: true,
    imports: [PublicBookDetailComponent, BookRowComponent],
    templateUrl: './public-book-detail-page.component.html',
    styleUrl: './public-book-detail-page.component.css'
})
export class PublicBookDetailPageComponent {
    private readonly _bookSvc = inject(UsedBookService);

    firstCardList = signal<CardsModel>({ title: "", bookCardList: [], moreLink:"" });

    ngOnInit(): void {
        this.getTop5PublicItemByUpdateAt().pipe(
            take(1),
            map(res => res.items.map(i => this.toBookCard(i))),
            catchError(err => { console.error("[ngOnInit]讀取過程錯誤", err); return EMPTY; })
        ).subscribe(cards => this.firstCardList.set({
            title: "喜歡這本書的人也在看...",
            bookCardList: cards,
            moreLink: "/used-book/books"
        }));
    }

    private getTop5PublicItemByUpdateAt() {
        const request: BookListQuery = {
            paging: {
                pageIndex: 1,
                pageSize: 5,
                sortBy: 'updated',
                sortDir: 'desc',
            },
            bookStatus: 'onshelf',
        }
        return this._bookSvc.getPublicBookList(request);
    }

    private toBookCard(item: PublicBookListItemDto): BookCard {
        return {
            coverImageUrl: item.coverImageUrl,
            saleTagList: item.saleTagList.map(tag => tag.name),
            id: item.id,
            title: item.title,
            authors: item.authors,
            salePrice: item.salePrice,
            conditionRating: item.conditionRating,
            slug: item.slug,
        };
    }
}

interface CardsModel {
    title: string;
    bookCardList: BookCard[];
    moreLink: string;
}
