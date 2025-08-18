import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Output, EventEmitter, Input, ChangeDetectorRef, NgZone, SimpleChanges, input, effect } from '@angular/core';
import Sortable from 'sortablejs';
import Dropzone from 'dropzone';
import { BookImageDto } from '../../dtos/book-image-dto';
import { BookImageCompactDto } from '../../dtos/book-image-compact.dto';
import { UpdateBookImageRequestDto } from '../../dtos/update-book-image-request.dto';
Dropzone.autoDiscover = false;

@Component({
    selector: 'app-ub-new-image-uploader',
    templateUrl: './new-image-uploader.component.html',
    styleUrls: [
        '../../../../../../node_modules/dropzone/dist/dropzone.css',
        './new-image-uploader.component.css',
    ],
    standalone: true
})
export class NewImageUploaderComponent {

    constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {
        // 當 imageList 變更時（父元件晚到也會觸發）
        effect(() => {
            const list = this.imageList();
            this.tryLoadImages(list);
        });
    }

    @ViewChild('dz') dzElem!: ElementRef<HTMLDivElement>;
    @Output() filesChange = new EventEmitter<UpdateBookImageRequestDto[]>(true);


    /** 可調參數 */
    @Input() maxFiles = 12;
    @Input() areaMessage = "拖曳圖片或點擊上傳（最多 12 張)";
    imageList = input<BookImageCompactDto[]>([]);

    private pendingImages: BookImageCompactDto[] | null = null;

    dz!: Dropzone;
    private sortable!: Sortable;
    private files: Dropzone.DropzoneFile[] = [];
    private meta = new WeakMap<Dropzone.DropzoneFile, Meta>();

    ngOnChanges(changes: SimpleChanges) {
        if (changes['imageList']) {
            const list = changes['imageList'].currentValue as BookImageCompactDto[];
            this.tryLoadImages(list);
        }
    }

    private tryLoadImages(list: BookImageCompactDto[]) {
        if (!list) return;
        if (!this.dz) {
            // DZ 還沒初始化，先暫存
            this.pendingImages = list;
            return;
        }
        // DZ 已初始化 → 重置並載入
        this.resetAndLoad(list);
    }

    private resetAndLoad(list: BookImageCompactDto[]) {
        // 1) 先清掉現有
        this.dz.removeAllFiles(true);
        this.files = [];
        this.meta = new WeakMap();

        // 2) 一次灌入舊圖（你原本的 loadInitialImages 邏輯）
        for (const img of list) {
            const mock = {
                name: `existing-${img.id}.jpg`,
                size: 0,
                type: 'image/jpeg',
                accepted: true,
                status: Dropzone.SUCCESS,
                upload: { progress: 100, total: 0, bytesSent: 0 }
            } as Dropzone.DropzoneFile;

            this.meta.set(mock, { kind: 'existing', existingId: img.id, url: img.mainUrl });
            this.dz.displayExistingFile(mock, img.mainUrl, undefined, 'anonymous');
            (this.dz.files as Dropzone.DropzoneFile[]).push(mock);
            this.hideSpinner(mock);
        }

        if (!this.sortable) this.initSortable();
        this.syncFilesOrder();     // 讓 this.files 與 DOM 對齊
        this.emitFiles();          // 通知父元件表單更新
        this.cdr.markForCheck();
    }

    ngAfterViewInit(): void {
        // 自訂 preview 樣板（加上 .dz-handle 作為 Sortable handle）
        const previewTemplate = `
            <div class="dz-preview dz-file-preview position-relative d-inline-block">

                <div class="position-relative d-inline-block" style="width:120px; height:120px;">
                    <img data-dz-thumbnail class="img-thumbnail" style="width:100%; height:100%; object-fit:cover;" draggable="false" />
                    <!-- 疊在 img 上的 spinner 覆蓋層 -->
                    <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-50 thumb-overlay">
                        <div class="spinner-border spinner-border-sm" role="status" aria-label="Loading"></div>
                    </div>
                </div>

                <!-- 拖曳 handle 左上角 -->
                <i class="bi bi-grip-vertical position-absolute top-0 start-0 m-1 p-1 rounded-1 text-dark lh-1"
                title="拖曳排序" style="cursor: move; background-color: white"></i>

                <!-- 移除按鈕 右上角 -->
                <button type="button"
                        class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                        data-dz-remove
                        title="移除圖片"
                        aria-label="移除圖片">
                    <i class="bi bi-x"></i>
                </button>

            </div>
        `;

        /** 初始化 Dropzone：綁在 dz 上 */
        const previews = this.dzElem.nativeElement.querySelector('.preview-area') as HTMLElement;
        this.dz = new Dropzone(this.dzElem.nativeElement, {
            previewTemplate,
            url: '/noop',
            autoProcessQueue: false,
            clickable: true,
            previewsContainer: previews,
            acceptedFiles: 'image/*',
            maxFiles: this.maxFiles,
            addRemoveLinks: false,

            // 覆蓋預設作法，移除預覽
            removedfile: function (file) {
                const preview = file.previewElement;
                if (preview) {
                    preview.remove();
                }
            }
        });

        // 事件：新增檔案
        this.dz.on('addedfile', (file: Dropzone.DropzoneFile) => {
            if (!this.sortable) this.initSortable();

            const m = this.meta.get(file);
            const isExisting = m?.kind === 'existing';

            // 只對「新上傳」做限制與重複檢查；舊圖跳過
            if (!isExisting) {
                if (file.size > 5 * 1024 * 1024) {
                    this.dz.removeFile(file);
                    alert('單檔上限 5MB');
                    return;
                }

                const isDuplicate = this.dz.files.find(f =>
                    f !== file && f.name === file.name && f.size === file.size
                );
                if (isDuplicate) {
                    this.dz.removeFile(file);
                    alert('這張圖片已經加入過了');
                    return;
                }
            }

            this.ngZone.run(() => {
                // 避免重複 push 同一物件
                if (!this.files.includes(file)) this.files.push(file);

                // 只有在沒有 meta（新檔）時才補上
                if (!m) this.meta.set(file, { kind: 'new', url: undefined });

                this.emitFiles();
                this.cdr.markForCheck();
            });

            this.hideSpinner(file);
        });

        // 事件：移除檔案
        this.dz.on('removedfile', (file: Dropzone.DropzoneFile) => {
            this.ngZone.run(() => {
                this.files = this.files.filter(f => f !== file);
                this.syncFilesOrder();
                this.cdr.markForCheck();
            });
        });

        // 事件：超過數量
        this.dz.on('maxfilesexceeded', (file) => {
            this.dz.removeFile(file);
            alert(`超過數量，最多 ${this.areaMessage} 張`);     // HACK: 這裡可以用 toast/訊息提示使用者
        });

        // 錯誤處理（副檔名不符、過大等）
        this.dz.on('error', (_file, msg) => {
            console.error('Dropzone error:', msg);
        });

        // 控制內部作為顯示訊息的 dz-message 物件
        const msg = this.dzElem.nativeElement.querySelector('.dz-message') as HTMLElement;
        this.dz.on('addedfile', () => msg.style.display = 'none');
        this.dz.on('removedfile', () => {
            if (this.dz.getAcceptedFiles().length === 0) msg.style.display = '';
        });


        if (this.pendingImages) {
            this.resetAndLoad(this.pendingImages);
            this.pendingImages = null;
        }
    }

    /** 移除動畫 */
    private hideSpinner(file: Dropzone.DropzoneFile) {

        const pe = file.previewElement as HTMLElement | null;
        const img = pe?.querySelector('img.img-thumbnail') as HTMLImageElement | null;
        const overlay = pe?.querySelector('.thumb-overlay') as HTMLElement | null;

        const hide = () => overlay?.classList.add('d-none');

        if (img) {
            if (img.complete && img.naturalWidth > 0) hide();
            else {
                img.addEventListener('load', hide, { once: true });
                img.addEventListener('error', hide, { once: true });
            }
        }
    }

    // Sortable
    /** 初始化 Sortable：綁在 Dropzone 的預覽容器上 */
    private initSortable() {
        const container = this.dz.previewsContainer as HTMLElement;
        this.sortable = Sortable.create(container, {
            animation: 150,
            draggable: '.dz-preview',
            handle: '.bi-grip-vertical',
            ghostClass: 'sortable-ghost',
            // 允許點擊移除按鈕不觸發拖曳
            filter: 'button[data-dz-remove]',
            preventOnFilter: false,
            onSort: () => {
                this.ngZone.run(() => {
                    this.syncFilesOrder();
                    this.cdr.markForCheck();
                });
            }
        });
    }

    // Sortable
    /** 依照目前 DOM 中 .dz-preview 的順序，重排 this.files */
    private syncFilesOrder() {
        const container = this.dz.previewsContainer as HTMLElement;
        const previews = Array.from(container.querySelectorAll('.dz-preview'));
        const pool = this.dz.getAcceptedFiles() as Dropzone.DropzoneFile[];

        const ordered: Dropzone.DropzoneFile[] = [];
        for (const el of previews) {
            const f = pool.find(x => (x as any).previewElement === el);
            if (f) ordered.push(f);
        }
        for (const f of pool) if (!ordered.includes(f)) ordered.push(f);

        this.files = ordered;
        this.emitFiles();
    }


    // Dropzone
    // 輸出 File 原生物件列表
    private emitFiles() {
        const list: UpdateBookImageRequestDto[] = this.files.map(f => {
            const m = this.meta.get(f);
            if (m?.kind === 'existing') {
                return { id: m.existingId!, url: m.url! };
            } else {
                return { image: f as File };
            }
        });
        this.filesChange.emit(list);
    }

    // Dropzone
    // 清除，尚未使用
    public clear() {
        this.dz.removeAllFiles(true);
        this.files = [];
        this.emitFiles();
    }

    ngOnDestroy(): void {
        this.sortable?.destroy();
        this.dz?.destroy();
    }
}

type Meta = { kind: 'existing' | 'new'; existingId?: number; url?: string; };
