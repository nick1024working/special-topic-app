import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsContainerComponent } from '../../components/toasts-container/toasts-container.component';

@Component({
    selector: 'app-ub-main-admin-layout',
    standalone: true,
    imports: [RouterOutlet, ToastsContainerComponent],
    templateUrl: './main-admin-layout.component.html',
    styleUrls: ['./main-admin-layout.component.css', '../../styles/bs-custom-override.scss']

})
export class MainAdminLayoutComponent {

}
