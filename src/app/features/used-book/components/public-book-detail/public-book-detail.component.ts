import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsedBookService } from '../../services/used-book.service';
import { PublicBookDetailDto } from '../../dtos/public-book-detail-dto';
import { take } from 'rxjs';
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
export class PublicBookDetailComponent implements AfterViewInit  {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly svc = inject(UsedBookService);

    @ViewChild('mainSwiper') mainSwiperEl!: ElementRef;
    @ViewChild('thumbSwiper') thumbSwiperEl!: ElementRef;
    book?: PublicBookDetailDto;
    bookOrigPrice: number = 9999;
    imageList?: BookImageDto[];

    ngOnInit() {
        const id: string = this.activatedRoute.snapshot.paramMap.get('id')!;

        // 呼叫 API，錯誤才導錯誤頁
        this.svc.getPublicDetail(id)
            .pipe(take(1))      // 只取一次就完成，將明確退訂
            .subscribe({
                next: (data) => {
                    this.book = data;
                    this.bookOrigPrice = data.salePrice / 0.8;
                    this.imageList = data.imageList;
                },
                error: () => this.router.navigate(['/error']),
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
