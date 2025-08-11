import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsedBookService } from '../../services/used-book.service';
import { PublicBookDetailDto } from '../../dtos/public-book-detail-dto';
import { take } from 'rxjs';

@Component({
    selector: 'app-ub-public-book-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './public-book-detail.component.html',
    styleUrl: './public-book-detail.component.css'
})
export class PublicBookDetailComponent {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly svc = inject(UsedBookService);

    book?: PublicBookDetailDto;

    ngOnInit() {
        const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));


        // 參數不合法就直接導錯誤頁
        if (Number.isNaN(id) || id <= 0) {
            // this.router.navigate(['/error']);
            return;
        }

        // 呼叫 API，錯誤才導錯誤頁
        this.svc.getPublicDetail(id)
            .pipe(take(1))      // 只取一次就完成，將明確退訂
            .subscribe({
                next: (data) => this.book = data,
                error: () => this.router.navigate(['/error']),
                // error: () => this.router.navigate(['/error']),
            });
    }
}
