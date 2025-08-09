// hero-carousel.component.ts
import { Component } from '@angular/core';

interface Banner {
    title: string;
    description: string;
    image: string;
}

@Component({
    selector: 'app-hero-carousel',
    templateUrl: './hero-carousel.component.html',
    styleUrls: ['./hero-carousel.component.css'],
    standalone: true,
    imports: []
})
export class HeroCarouselComponent {

}
