import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderWrapComponent } from "app/shared/components/header-wrap/header-wrap.component";
import { FooterWrapComponent } from "app/shared/components/footer-wrap/footer-wrap.component";

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderWrapComponent, FooterWrapComponent],
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {

}
