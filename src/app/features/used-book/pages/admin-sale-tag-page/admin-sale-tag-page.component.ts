import { UpdatePartialBookSaleTagRequestDto } from './../../dtos/update-partial-book-sale-tag-request-dto';
import { CreateSaleTagRequestDto } from './../../dtos/create-sale-tag-request-dto';
import { Component, ElementRef, ViewChild, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaleTagService } from '../../services/sale-tag.service';
import { firstValueFrom, Observable } from 'rxjs';
import Sortable, { SortableEvent } from 'sortablejs';
import { BookSaleTagDto } from '../../dtos/book-sale-tag-dto';

@Component({
    selector: 'app-ub-admin-sale-tag-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-sale-tag-page.component.html',
    styleUrl: './admin-sale-tag-page.component.css'
})
export class AdminSaleTagPageComponent {

    // 不使用 DI + constructor ，嘗試使用 inject
    private svc = inject(SaleTagService);

    readonly saleTagList = signal<BookSaleTagDto[]>([]);
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
            this.saleTagList.update(arr => [...arr, { id, name: req.name, isActive: req.isActive, slug: id.toString() }]);
        } catch (e) {
            console.error(e);
            this.error.set("新增失敗");
        }
    }

    // 更新並樂觀更新本地列表
    async update(id: number, req: UpdatePartialBookSaleTagRequestDto) {
        const prev = this.saleTagList();

        // this.saleTagList.update(arr =>
        // );

        // try {
        //     await firstValueFrom(this.svc.UpdateSaleTag(id, req));
        //     this.saleTagList.update(arr => arr.);
        // } catch (e) {
        //     console.error(e);
        //     this.error.set("更新失敗");
        // }
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
