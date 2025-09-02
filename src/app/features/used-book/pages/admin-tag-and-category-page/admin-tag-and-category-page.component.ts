import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManageSaleTagComponent } from '../../components/manage-sale-tag/manage-sale-tag.component';
import { Component } from '@angular/core';
import { ManageCategoryComponent } from "../../components/manage-category/manage-category.component";

@Component({
    selector: 'app-ub-admin-tag-and-category-page',
    standalone: true,
    imports: [CommonModule, FormsModule, ManageSaleTagComponent, ManageCategoryComponent],
    templateUrl: './admin-tag-and-category-page.component.html',
    styleUrls: [
        './admin-tag-and-category-page.component.css',
        '../../styles/bs-custom-override.scss',
    ],
})
export class AdminSaleTagPageComponent {

}
