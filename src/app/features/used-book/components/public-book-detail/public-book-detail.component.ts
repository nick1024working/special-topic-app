import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsedBookService } from '../../services/used-book.service';
import { PublicBookDetailDto } from '../../dtos/public-book-detail-dto';
import { catchError, distinctUntilChanged, EMPTY, filter, map, switchMap, take } from 'rxjs';
import { BookImageDto } from '../../dtos/book-image-dto';
// Swiper
import { Navigation, Thumbs } from 'swiper/modules';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

@Component({
    selector: 'app-ub-public-book-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './public-book-detail.component.html',
    styleUrl: './public-book-detail.component.css'
})
export class PublicBookDetailComponent implements AfterViewInit {
    private readonly _activatedRoute = inject(ActivatedRoute);
    private readonly _router = inject(Router);
    private readonly _svc = inject(UsedBookService);

    @ViewChild('mainSwiper') mainSwiperEl!: ElementRef;
    @ViewChild('thumbSwiper') thumbSwiperEl!: ElementRef;
    book?: PublicBookDetailDto;
    bookOrigPrice: number = 9999;
    imageList?: BookImageDto[];

    ngOnInit() {
        this._activatedRoute.paramMap
            .pipe(
                map(pm => pm.get('id')),                // 取出 :id
                filter((id): id is string => !!id),     // 避免 null
                distinctUntilChanged(),                 // id 相同不重跑
                switchMap(id =>
                    this._svc.getPublicDetail(id).pipe(
                        take(1),                        // 只取一次結果
                        catchError(() => {
                            this._router.navigate(['/error']);
                            return EMPTY;               // 中止這次流程
                        })
                    )
                ),
            )
            .subscribe(data => {
                this.book = data;
                this.bookOrigPrice = data.salePrice / 0.8;
                this.imageList = data.imageList;

                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            });
    }

    ngAfterViewInit() {
        const thumbSwiper = new Swiper(this.thumbSwiperEl.nativeElement, {
            modules: [Navigation, Thumbs],
            slidesPerView: 4,
            spaceBetween: 10
        });

        new Swiper(this.mainSwiperEl.nativeElement, {
            modules: [Navigation, Thumbs],
            spaceBetween: 10,
            thumbs: {
                swiper: thumbSwiper
            }
        });
    }
}
