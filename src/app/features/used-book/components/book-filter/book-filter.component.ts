import { Component, EventEmitter, inject, Output, signal, ViewEncapsulation } from '@angular/core';
import { IdNameDto } from '../../dtos/id-name.dto';
import { LookupService } from '../../services/lookup.service';
import { BookListQuery, DEFAULT_BOOK_LIST_QUERY } from '../../dtos/book-list-query.dto';

@Component({
    selector: 'app-ub-book-filter',
    standalone: true,
    imports: [],
    templateUrl: './book-filter.component.html',
    styleUrls: [
        './book-filter.component.css',
        '../../styles/bs-custom-override.scss',
    ],
    encapsulation: ViewEncapsulation.Emulated,
})
export class BookFilterComponent {
    @Output() query = new EventEmitter<BookListQuery>();

    private readonly lookupSvc = inject(LookupService);

    priceRangeList: PriceRange[] = [
        { minPrice: 0, maxPrice: 100, name: '150元以下' },
        { minPrice: 101, maxPrice: 300, name: '300元以下' },
        { minPrice: 301, maxPrice: 500, name: '500元以下' },
        { minPrice: 501, maxPrice: 999, name: '999元以下' },
        { minPrice: 1000, maxPrice: null, name: '999元以上' },
    ]
    categoryList: IdNameDto[] = [];
    saleTagList: IdNameDto[] = [];

    // Signals：只負責 UI 中狀態
    selectedPrice = signal<{ minPrice: number | null, maxPrice: number | null } | null>(null);
    selectedTags = signal<number[]>([]);
    selectedCategoryId = signal<number | null>(null);
    keyword = signal<string>('');


    ngOnInit(): void {
        this.lookupSvc.GetBookCategoryList().subscribe({
            next: (res) => this.categoryList = res,
            error: (err) => console.error('[ngOnInit]取得 BookCategory 清單時失敗', err),
        });
        this.lookupSvc.GetSaleTagList().subscribe({
            next: (res) => this.saleTagList = res,
            error: (err) => console.error('[ngOnInit]取得 SaleTag 清單時失敗', err),
        });
    }

    // ========== 核心函數 ==========

    onFilterChange() {
        const price = this.selectedPrice();
        const tags = this.selectedTags();
        const categoryId = this.selectedCategoryId();
        const keyword = this.keyword()?.trim();

        const result: BookListQuery = {
            ...DEFAULT_BOOK_LIST_QUERY,
            keyword: keyword ? keyword : undefined,
            minPrice: price?.minPrice ?? undefined,
            maxPrice: price?.maxPrice ?? undefined,
            categoryId: categoryId ?? undefined,
            saleTagIds: tags.length ? tags : undefined,
        }

        this.query.emit(result);
    }

    // ========== Price 函數 ==========

    // 選擇
    onPriceSelect(min: number | null, max: number | null) {
        this.selectedPrice.set({ minPrice: min, maxPrice: max });
        this.onFilterChange();
    }

    // 判斷價格是否選中， HETML property 確認用
    isPriceSelected(item: { minPrice: number | null, maxPrice: number | null }) {
        const sel = this.selectedPrice();
        return sel?.minPrice === item.minPrice && sel?.maxPrice === item.maxPrice;
    }

    // ========== SaleTag 函數 ==========

    // 選擇 狀態切換
    onSaleTagToggle(id: number) {
        const tags = this.selectedTags();
        if (tags.includes(id)) {
            this.selectedTags.set(tags.filter(t => t !== id));
        } else {
            this.selectedTags.set([...tags, id]);
        }
        this.onFilterChange();
    }

    isSaleTagSelected(id: number) {
        return this.selectedTags().includes(id);
    }

    onSaleTagClear() {
        this.selectedTags.set([]);
        this.onFilterChange();
    }

    // ========== Category 函數 ==========

    onCategorySelect(id: number) {
        this.selectedCategoryId.set(id);
        this.onFilterChange();
    }

    isCategorySelected(id: number) {
        return this.selectedCategoryId() === id;
    }

    onCategoryClear() {
        this.selectedCategoryId.set(null);
        this.onFilterChange();
    }

}

export interface PriceRange {
    minPrice: number | null;
    maxPrice: number | null;
    name: string;
}
