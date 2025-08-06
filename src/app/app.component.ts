import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderWrapComponent } from "./shared/ui/header-wrap/header-wrap.component";
import { FooterWrapComponent } from "./shared/ui/footer-wrap/footer-wrap.component";
import { HeroCarouselComponent } from "./shared/ui/hero-carousel/hero-carousel.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderWrapComponent, FooterWrapComponent, HeroCarouselComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'special-topic-app';
}
