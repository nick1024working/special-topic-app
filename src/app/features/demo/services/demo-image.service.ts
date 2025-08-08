import { Injectable } from '@angular/core';
import { DemoCardDto } from '../dtos/demo-card.dto';
import { delay, Observable, of } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class DemoImageService {

    /** 模擬從後端取回 DemoCardDto 資料 */
    getCards(): Observable<DemoCardDto[]> {
        const result: DemoCardDto[] = [
            {
                title: 'Angular 基礎',
                text: '學習 Angular Component、Service 與資料綁定',
                imageUrl: 'https://placehold.co/300x200?text=Angular%0A基礎&font=montserrat&size=20',
                redirectUrl: 'https://angular.io/start'
            },
            {
                title: 'Bootstrap 圖示',
                text: '用 SVG 實現清爽 UI 體驗',
                imageUrl: 'https://placehold.co/300x200?text=Bootstrap%0AIcons&font=montserrat&size=20',
                redirectUrl: 'https://icons.getbootstrap.com/'
            },
            {
                title: 'RxJS 快速入門',
                text: '掌握非同步資料流的處理方式',
                imageUrl: 'https://placehold.co/300x200?text=RxJS%0A入門&font=montserrat&size=20',
                redirectUrl: 'https://rxjs.dev/'
            },
            {
                title: 'Angular 基礎',
                text: '學習 Angular Component、Service 與資料綁定',
                imageUrl: 'https://placehold.co/300x200?text=Angular%0A基礎&font=montserrat&size=20',
                redirectUrl: 'https://angular.io/start'
            },
            {
                title: 'Bootstrap 圖示',
                text: '用 SVG 實現清爽 UI 體驗',
                imageUrl: 'https://placehold.co/300x200?text=Bootstrap%0AIcons&font=montserrat&size=20',
                redirectUrl: 'https://icons.getbootstrap.com/'
            },
            {
                title: 'RxJS 快速入門',
                text: '掌握非同步資料流的處理方式',
                imageUrl: 'https://placehold.co/300x200?text=RxJS%0A入門&font=montserrat&size=20',
                redirectUrl: 'https://rxjs.dev/'
            },
            {
                title: 'Angular 基礎',
                text: '學習 Angular Component、Service 與資料綁定',
                imageUrl: 'https://placehold.co/300x200?text=Angular%0A基礎&font=montserrat&size=20',
                redirectUrl: 'https://angular.io/start'
            },
            {
                title: 'Bootstrap 圖示',
                text: '用 SVG 實現清爽 UI 體驗',
                imageUrl: 'https://placehold.co/300x200?text=Bootstrap%0AIcons&font=montserrat&size=20',
                redirectUrl: 'https://icons.getbootstrap.com/'
            },
            {
                title: 'RxJS 快速入門',
                text: '掌握非同步資料流的處理方式',
                imageUrl: 'https://placehold.co/300x200?text=RxJS%0A入門&font=montserrat&size=20',
                redirectUrl: 'https://rxjs.dev/'
            },
            {
                title: 'Angular 基礎',
                text: '學習 Angular Component、Service 與資料綁定',
                imageUrl: 'https://placehold.co/300x200?text=Angular%0A基礎&font=montserrat&size=20',
                redirectUrl: 'https://angular.io/start'
            },
            {
                title: 'Bootstrap 圖示',
                text: '用 SVG 實現清爽 UI 體驗',
                imageUrl: 'https://placehold.co/300x200?text=Bootstrap%0AIcons&font=montserrat&size=20',
                redirectUrl: 'https://icons.getbootstrap.com/'
            },
            {
                title: 'RxJS 快速入門',
                text: '掌握非同步資料流的處理方式',
                imageUrl: 'https://placehold.co/300x200?text=RxJS%0A入門&font=montserrat&size=20',
                redirectUrl: 'https://rxjs.dev/'
            },
            {
                title: 'Angular 基礎',
                text: '學習 Angular Component、Service 與資料綁定',
                imageUrl: 'https://placehold.co/300x200?text=Angular%0A基礎&font=montserrat&size=20',
                redirectUrl: 'https://angular.io/start'
            },
            {
                title: 'Bootstrap 圖示',
                text: '用 SVG 實現清爽 UI 體驗',
                imageUrl: 'https://placehold.co/300x200?text=Bootstrap%0AIcons&font=montserrat&size=20',
                redirectUrl: 'https://icons.getbootstrap.com/'
            },
        ];

        // 模擬 300ms 延遲後回傳
        return of(result).pipe(delay(300));
    }

}
