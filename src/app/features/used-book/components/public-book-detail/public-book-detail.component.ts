import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { UsedBookService } from '../../services/used-book.service';
import { PublicBookDetailDto } from '../../dtos/public-book-detail-dto';

@Component({
    selector: 'app-ub-public-book-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './public-book-detail.component.html',
    styleUrl: './public-book-detail.component.css'
})
export class PublicBookDetailComponent {
    private route = inject(ActivatedRoute);
    private svc = inject(UsedBookService);
    // private imgSvc = inject(ImageUrlService);



    vm?: PublicBookDetailDto;

    /*
    ngOnInit() {
        this.route.paramMap
            .pipe(
                switchMap(p => this.svc.getPublicDetail$(Number(p.get('id')))),
                switchMap(dto =>
                    this.imgSvc.hydrateImageUrls$(dto.imageList).pipe(
                        // 將解析好的 URL 填回 vm（不改動其他欄位）
                        // 你要保留原本的 imageList 結構以便未來 Splide/Lightbox 掛上
                        map(list => ({ ...dto, imageList: list }))
                    )
                )
            )
            .subscribe(dto => (this.vm = dto));
    }
    */
}
