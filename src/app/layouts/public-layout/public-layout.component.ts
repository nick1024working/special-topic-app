import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterWrapComponent } from "app/shared/components/footer-wrap/footer-wrap.component";
import { TopContentComponent } from "app/shared/components/top-content/top-content.component";
import { HeaderComponent } from "app/shared/components/header/header.component";

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, FooterWrapComponent, TopContentComponent, HeaderComponent],
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {

}
