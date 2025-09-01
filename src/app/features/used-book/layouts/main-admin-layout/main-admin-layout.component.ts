import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-ub-main-admin-layout',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './main-admin-layout.component.html',
    styleUrls: ['./main-admin-layout.component.css', '../../styles/bs-custom-override.scss']

})
export class MainAdminLayoutComponent {

}
