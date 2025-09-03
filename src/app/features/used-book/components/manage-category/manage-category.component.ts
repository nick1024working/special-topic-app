import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import Sortable from 'sortablejs';
import { firstValueFrom } from 'rxjs';
import { UpdateOrderByIdRequestDto } from '../../dtos/update-order-by-id-request.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'app/shared/services/toast.service';
import { CategoryService } from '../../services/category.service';
import { BookCategoryDto } from '../../dtos/book-category.dto';
import { CreateCategoryRequestDto } from '../../dtos/create-category-request.dto';
import { UpdatePartialBookCategoryRequestDto } from '../../dtos/update-partial-book-category-request.dto';

@Component({
    selector: 'app-ub-manage-category',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './manage-category.component.html',
    styleUrls: [
        './manage-category.component.css',
        '../../styles/bs-custom-override.scss',
    ],
})
export class ManageCategoryComponent {
    private readonly categorySvc = inject(CategoryService);
    private readonly toastSvc = inject(ToastService);

    readonly categoryList = signal<BookCategoryDto[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    // 新增用
    inputReq: CreateCategoryRequestDto = { name: "", isActive: true };
    tempName: string = '';

    private sortable!: Sortable;
    @ViewChild('sortableList') sortableList!: ElementRef<HTMLElement>;

    private initSortable() {
        if (this.sortable) this.sortable.destroy();
        this.sortable = Sortable.create(this.sortableList.nativeElement, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: async (evt) => {
                const { oldIndex, newIndex } = evt;
                if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;

                const snapshot = this.categoryList();
                this.categoryList.update(list => {
                    const newList = [...list];
                    const moved = newList.splice(oldIndex!, 1)[0];
                    newList.splice(evt.newIndex!, 0, moved);
                    return newList;
                });

                try {
                    await this.updateOrder();
                } catch (e) {
                    console.error(e);
                    this.categoryList.set(snapshot);
                    this.error.set('排序更新失敗');
                }
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
            const data = await firstValueFrom(this.categorySvc.getAllCategories());
            this.categoryList.set(
                data.map(tag => ({
                    ...tag,
                    isEditing: false,
                }))
            );
        } catch (e) {
            console.error(e);
            this.error.set("讀取失敗");
        } finally {
            this.loading.set(false);
        }
    }

    // 新增，並樂觀更新本地列表
    async create(req: CreateCategoryRequestDto) {
        const prev = this.categoryList();

        const tempId: number = Date.now();
        this.categoryList.update(arr => [...arr, {
            id: tempId,
            name: req.name,
            isActive: req.isActive,
            slug: tempId.toString()
        }]);

        this.inputReq = { name: "", isActive: true };

        try {
            const realId = await firstValueFrom(this.categorySvc.createCategory(req));
            this.toastSvc.info("新增主題成功!");
            this.categoryList.update(arr => arr.map(tag =>
                tag.id === tempId ? { ...tag, id: realId, slug: realId.toString() } : tag));
        } catch (e) {
            this.categoryList.set(prev);
            this.error.set("新增失敗");
        }
    }

    // 切換編輯，並樂觀更新
    async onEditToggle(dto: BookCategoryDto) {
        dto.isEditing = !dto.isEditing;
        // 當前是可編輯，把資料載入 UI
        if (dto.isEditing) {
            this.tempName = dto.name;
            return;
        }
        // 當前是編輯完畢，驗證後送
        const value = this.tempName.trim();
        if (value !== '' && value !== dto.name) {
            const req: UpdatePartialBookCategoryRequestDto = { name: value };
            this.update(dto.id, req);
        }
    }

    // 更新，並樂觀更新本地列表
    async update(id: number, req: UpdatePartialBookCategoryRequestDto) {
        const prev = this.categoryList();

        this.categoryList.update(arr =>
            arr.map(tag => tag.id === id ? { ...tag, ...req } : tag)
        );

        try {
            await firstValueFrom(this.categorySvc.updateCategory(id, req));
        } catch (e) {
            this.categoryList.set(prev);
            this.error.set("更新失敗");
        }
    }

    // 更新啟用狀態，並樂觀更新本地列表
    updateActiveStatus(id: number, isActive: boolean) {
        const req: UpdatePartialBookCategoryRequestDto = { isActive };
        this.update(id, req);
    }

    // 更新排序，重新刷新本地列表
    async updateOrder() {
        const req: UpdateOrderByIdRequestDto = {
            idList: this.categoryList().map(t => t.id)
        };
        await firstValueFrom(this.categorySvc.updateAllCategoriesOrder(req));
    }

    // 刪除，並樂觀更新本地列表
    async remove(id: number) {
        const prev = this.categoryList();
        this.categoryList.update(arr => arr.filter(x => x.id != id));

        try {
            await firstValueFrom(this.categorySvc.deleteCategory(id));
        } catch (e) {
            this.categoryList.set(prev);
            console.error(e);
            this.error.set("刪除失敗");
        }
    }
}
