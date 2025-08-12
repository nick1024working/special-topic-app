import { CreateSaleTagRequestDto } from './../../dtos/create-sale-tag-request-dto';
import { Component, ElementRef, ViewChild, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Sortable, { SortableEvent } from 'sortablejs';
import { SaleTagService } from '../../services/sale-tag.service';
import { firstValueFrom, Observable } from 'rxjs';

@Component({
    selector: 'app-ub-test',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './test.component.html',
    styleUrl: './test.component.css'
})
export class TestComponent {

    // 不使用 DI + constructor ，嘗試使用 inject
    private svc = inject(SaleTagService);

    readonly saleTagList = signal<SaleTag[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    ngOnInit() { this.load(); }

    // 正常 async 三階段 + 手動 signal
    async load() {
        this.loading.set(true);
        this.error.set(null);
        try {
            const data = await firstValueFrom(this.svc.GetAllSaleTags());
            this.saleTagList.set(data);
        } catch (e) {
            console.error(e);
            this.error.set("讀取失敗");
        } finally {
            this.loading.set(false);
        }
    }

    // 新增並樂觀更新本地列表
    async create(req: CreateSaleTagRequestDto) {
        try {
            const id = await firstValueFrom(this.svc.CreateSaleTag(req));
            this.saleTagList.update(arr => [...arr, { id, name: req.name }]);
        } catch (e) {
            console.error(e);
            this.error.set("興曾失敗");
        }
    }

    // 刪除並樂觀更新本地列表
    async remove(id: number) {
        try {
            await firstValueFrom(this.svc.DeleteSaleTag(id));
            this.saleTagList.update(arr => arr.filter(x => x.id != id));
        } catch (e) {
            console.error(e);
            this.error.set("刪除失敗");
        }
    }

    inputReq: CreateSaleTagRequestDto = { name: "", isActive: true };
    inputId: number = 0;
}

export interface SaleTag {
    id: number;
    name: string;
}
