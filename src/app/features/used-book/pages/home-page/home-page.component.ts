import { BookCard } from '../../models/book-card.model';
import { Component, inject, signal } from '@angular/core';
import { BookRowComponent } from "../../components/book-row/book-row.component";
import { RouterLink } from '@angular/router';
import { IdNameDto } from '../../dtos/id-name.dto';
import { LookupService } from '../../services/lookup.service';
import { UsedBookService } from '../../services/used-book.service';
import { catchError, EMPTY, forkJoin, map, switchMap, tap } from 'rxjs';
import { BookListQuery } from '../../dtos/book-list-query.dto';
import { DEFAULT_PAGING_QUERY } from '../../dtos/paging-query.dto';
import { PublicBookListItemDto } from '../../dtos/public-book-list-item.dto';

@Component({
    selector: 'app-ub-home-page',
    standalone: true,
    imports: [BookRowComponent, RouterLink],
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css', '../../styles/bs-custom-override.scss',]
})
export class HomePageComponent {
    private readonly lookupSvc = inject(LookupService);
    private readonly bookSvc = inject(UsedBookService);

    categoryList = signal<IdNameDto[]>([]);
    saleTagList = signal<IdNameDto[]>([]);
    tagWithCardList = signal<TagWithCardsModel[]>([]);

    ngOnInit() {
        // 分類清單
        this.lookupSvc.getBookCategoryList().subscribe({
            next: (res) => this.categoryList.set(res.slice(0, 5)),
            error: (err) => console.error("[ngOnInit]讀取分類清單錯誤", err)
        });
        // 促銷標籤列表 + 對應的暢銷 top5
        this.lookupSvc.getSaleTagList().pipe(
            tap(tags => this.saleTagList.set(tags)),
            switchMap(tags => {
                const jobs$ = tags.map(tag =>
                    this.getTop5PublicItemByTagId(tag.id).pipe(
                        map(res => res.items.map(this.toBookCard)),
                        map(bookCards => ({ tag, bookCards })),
                    )
                )
                return jobs$.length ? forkJoin(jobs$) : EMPTY;
            }),
            tap(res => {
                const nextList: TagWithCardsModel[] = [];
                for (const { tag, bookCards } of res) {
                    nextList.push({
                        id: tag.id,
                        name: tag.name,
                        bookCardList: bookCards,
                        moreLink: `/used-book/books?saleTagIds=${tag.id}`,
                    })
                }
                this.tagWithCardList.set(nextList);
            }),
            catchError(err => { console.error("[ngOnInit]讀取過程錯誤", err); return EMPTY; })
        ).subscribe();
    }

    private getTop5PublicItemByTagId(tagId: number) {
        const request: BookListQuery = {
            paging: {
                ...DEFAULT_PAGING_QUERY,
                pageIndex: 1,
                pageSize: 5,
            },
            bookStatus: 'onshelf',
            saleTagIds: [tagId],
        }
        return this.bookSvc.getPublicBookList(request);
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

    scrollTop() {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
}

interface TagWithCardsModel {
    id: number;
    name: string;
    bookCardList: BookCard[];
    moreLink: string;
}
