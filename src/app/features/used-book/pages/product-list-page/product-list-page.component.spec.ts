// product-list-page.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

export interface Product {
    id: number;
    title: string;
    price: number;
    original: number;
    discount?: string;
    img: string;
}

@Component({
    selector: 'app-product-list-page',
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './product-list-page.component.html',
    styleUrls: ['./product-list-page.component.css']
})
export class ProductListPageComponent {
    onImgError(event: Event) {
        const target = event.target as HTMLImageElement;
        target.src = 'https://placehold.co/300x400?text=Book+Cover';
    }

    products: Product[] = [
        { id: 1, title: 'Ikigai', price: 14.79, original: 17.00, img: 'assets/images/books/product/1.jpg' },
        { id: 2, title: 'How To Stop Working', price: 8.79, original: 10.00, img: 'assets/images/books/product/2.jpg' },
        { id: 3, title: 'Becoming', price: 16.79, original: 19.00, img: 'assets/images/books/product/3.jpg' },
        { id: 4, title: 'Selling You', price: 2.79, original: 3.00, discount: '7% Off', img: 'assets/images/books/product/4.jpg' },
        { id: 5, title: 'Crawdads', price: 20.60, original: 22.00, img: 'assets/images/books/product/7.jpg' },
        { id: 6, title: 'Dreamers Doers', price: 8.20, original: 10.00, img: 'assets/images/books/product/8.jpg' }
    ];
}
