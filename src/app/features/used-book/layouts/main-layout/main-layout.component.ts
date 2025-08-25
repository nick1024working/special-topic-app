import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-ub-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: [
        './main-layout.component.css',
        '../../styles/bs-custom-override.scss',
    ],
})
export class MainLayoutComponent {

}
