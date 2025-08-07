import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderWrapComponent } from "./shared/ui/components/header-wrap/header-wrap.component";
import { FooterWrapComponent } from "./shared/ui/components/footer-wrap/footer-wrap.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderWrapComponent, FooterWrapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'special-topic-app';
}
