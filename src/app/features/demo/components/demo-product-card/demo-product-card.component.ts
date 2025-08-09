import { Component, Input } from '@angular/core';
import { DemoCardDto } from '../../dtos/demo-card.dto';

@Component({
    selector: 'app-dm-demo-product-card',
    standalone: true,
    imports: [],
    templateUrl: './demo-product-card.component.html',
    styleUrl: './demo-product-card.component.css'
})
/** 接收 DemoCardDto 並用卡片方式呈現 */
export class DemoProductCardComponent {
    @Input() card!: DemoCardDto;
}
