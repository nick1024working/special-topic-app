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

    private sortable!: Sortable;
    @ViewChild('sortableList') sortableList!: ElementRef<HTMLElement>;

    private initSortable() {
        if (this.sortable) this.sortable.destroy();
        this.sortable = Sortable.create(this.sortableList.nativeElement, {
            animation: 150,
            onEnd: (evt) => {
                this.saleTagList.update(list => {
                    const newList = [...list];
                    const moved = newList.splice(evt.oldIndex!, 1)[0];
                    newList.splice(evt.newIndex!, 0, moved);
                    return newList;
                });
            }
        });
    }

    ngOnInit() {
        this.load();

        queueMicrotask(() => this.initSortable());
    }

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

    // 新增，並樂觀更新本地列表
    async create(req: CreateSaleTagRequestDto) {
        const prev = this.saleTagList();

        const tempId: number = Date.now();
        this.saleTagList.update(arr => [...arr, {
            id: tempId,
            name: req.name,
            isActive: req.isActive,
            slug: tempId.toString()
        }]);

        try {
            const realId = await firstValueFrom(this.svc.CreateSaleTag(req));
            this.saleTagList.update(arr => arr.map(tag => tag.id === tempId ? { ...tag, id: realId, slug: realId.toString() } : tag));
        } catch (e) {
            this.saleTagList.set(prev);
            console.error(e);
            this.error.set("新增失敗");
        }
    }

    // 更新，並樂觀更新本地列表
    async update(id: number, req: UpdatePartialBookSaleTagRequestDto) {
        const prev = this.saleTagList();

        this.saleTagList.update(arr =>
            arr.map(tag => tag.id === id ? { ...tag, ...req } : tag)
        );

        try {
            await firstValueFrom(this.svc.UpdateSaleTag(id, req));
        } catch (e) {
            this.saleTagList.set(prev);
            console.error(e);
            this.error.set("更新失敗");
        }
    }

    // 更新啟用狀態，並樂觀更新本地列表
    async updateActiveStatus(id: number, isActive: boolean) {
        const req: UpdatePartialBookSaleTagRequestDto = { isActive };
        this.update(id, req);
    }

    // 刪除，並樂觀更新本地列表
    async remove(id: number) {
        const prev = this.saleTagList();
        this.saleTagList.update(arr => arr.filter(x => x.id != id));

        try {
            await firstValueFrom(this.svc.DeleteSaleTag(id));
        } catch (e) {
            this.saleTagList.set(prev);
            console.error(e);
            this.error.set("刪除失敗");
        }
    }

    inputReq: CreateSaleTagRequestDto = { name: "", isActive: true };
    inputId: number = 0;
}
