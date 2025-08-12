import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-footer-wrap',
  standalone: true,
  templateUrl: './footer-wrap.component.html',
  styleUrls: ['./footer-wrap.component.css'],
  imports: [RouterLink, RouterLinkActive]
})
export class FooterWrapComponent {

}
