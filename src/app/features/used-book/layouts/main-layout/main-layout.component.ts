import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ControlPanelComponent } from "../../components/control-panel/control-panel.component";

@Component({
  selector: 'app-ub-main-layout',
  standalone: true,
  imports: [RouterOutlet, ControlPanelComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: [
        './main-layout.component.css',
        '../../styles/bs-custom-override.scss',
    ],
})
export class MainLayoutComponent {

}
