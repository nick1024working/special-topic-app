import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { AdminSidebarComponent } from "app/shared/components/admin-sidebar/admin-sidebar.component";
import { ToastsContainerComponent } from "app/shared/components/toasts-container/toasts-container.component";

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, ToastsContainerComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {

}
