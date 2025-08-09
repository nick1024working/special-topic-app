import { Component } from '@angular/core';
import { DemoProductCardComponent } from "../../components/demo-product-card/demo-product-card.component";
import { DemoImageService } from '../../services/demo-image.service';
import { DemoCardDto } from '../../dtos/demo-card.dto';

@Component({
  selector: 'app-dm-demo-product-list-page',
  standalone: true,
  imports: [DemoProductCardComponent],
  templateUrl: './demo-product-list-page.component.html',
  styleUrl: './demo-product-list-page.component.css'
})
/** 從模擬後端取回 DemoCardDto 資料，並傳入 DemoProductCardComponent 呈現在畫面 */
export class DemoProductListPageComponent {

    cards: DemoCardDto[] = [];

    constructor(private demoImageService: DemoImageService) {}

    // 此時我們要讓 @for 使用 cards 產生 <app-demo-product-card>
    // <app-demo-product-card> 需要 @Input()
    // 故我們在 ngOnInit() hook 先載入資料
    ngOnInit(): void {
        this.demoImageService.getCards().subscribe({
            next: (res) => this.cards = res,
            error: (err) => console.error('取得 Demo 圖片失敗', err),
        });
    }
}
