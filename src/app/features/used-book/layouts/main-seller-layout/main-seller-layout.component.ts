import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ControlPanelComponent } from "../../components/control-panel/control-panel.component";
import { SellerSidebarComponent } from "../../components/seller-sidebar/seller-sidebar.component";
import { ToastsContainerComponent } from "app/shared/components/toasts-container/toasts-container.component";

@Component({
  selector: 'app-ub-main-seller-layout',
  standalone: true,
  imports: [RouterOutlet, ControlPanelComponent, SellerSidebarComponent, ToastsContainerComponent],
  templateUrl: './main-seller-layout.component.html',
  styleUrl: './main-seller-layout.component.css'
})
export class MainSellerLayoutComponent {

}
