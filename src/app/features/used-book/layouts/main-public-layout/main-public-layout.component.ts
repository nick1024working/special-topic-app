import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ControlPanelComponent } from "../../components/control-panel/control-panel.component";

@Component({
    selector: 'app-ub-main-public-layout',
    standalone: true,
    imports: [RouterOutlet, ControlPanelComponent],
    templateUrl: './main-public-layout.component.html',
    styleUrls: ['./main-public-layout.component.css', '../../styles/bs-custom-override.scss']
})
export class MainPublicLayoutComponent {

}
