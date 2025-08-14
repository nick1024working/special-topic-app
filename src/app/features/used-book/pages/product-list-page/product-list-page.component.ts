import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ub-product-list-page',
  standalone: true,
  templateUrl: './product-list-page.component.html',
  styleUrls: ['./product-list-page.component.css'],
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductListPageComponent {
  products = [
    { id: 1, title: 'Ikigai',          price: 14.79, original: 17,   img: 'https://placehold.co/300x440?text=Ikigai' },
    { id: 2, title: 'Stop Working',    price: 8.79,  original: 10,   img: 'https://placehold.co/300x440?text=Stop+Work' },
    { id: 3, title: 'Becoming',        price: 16.79, original: 19,   img: 'https://placehold.co/300x440?text=Becoming' },
    { id: 4, title: 'Selling You',     price: 2.79,  original: 3,    img: 'https://placehold.co/300x440?text=Selling+You', discount: '7% Off' },
    { id: 5, title: 'Crawdads',        price: 20.6,  original: 22,   img: 'https://placehold.co/300x440?text=Crawdads' },
    { id: 6, title: 'Dreamers Doers',  price: 8.2,   original: 10,   img: 'https://placehold.co/300x440?text=Dreamers' }
  ];

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'https://placehold.co/300x440?text=No+Image';
  }
}
