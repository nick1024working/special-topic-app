import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Output, EventEmitter, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import Sortable from 'sortablejs';
import Dropzone from 'dropzone';
Dropzone.autoDiscover = false;

@Component({
    selector: 'app-ub-image-uploader',
    templateUrl: './image-uploader.component.html',
    styleUrls: [
        '../../../../../../node_modules/dropzone/dist/dropzone.css',
        './image-uploader.component.css',
    ],
    standalone: true
})
export class ImageUploaderComponent {

    constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) { }

    @ViewChild('dz') dzElem!: ElementRef<HTMLDivElement>;
    @Output() filesChanged = new EventEmitter<File[]>();

    /** 可調參數 */
    @Input() maxFiles = 12;
    @Input() areaMessage = "拖曳圖片或點擊上傳（最多 12 張)";

    dz!: Dropzone;
    private sortable!: Sortable;
    private files: File[] = [];

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

            // 新增第一張時初始化 Sortable（只做一次）
            if (!this.sortable) {
                this.initSortable();
            }

            // 偵測檔案過大：不加入列表、直接移除預覽
            if (file.size > 5 * 1024 * 1024) {
                this.dz.removeFile(file);
                alert('單檔上限 5MB');   // HACK: 這裡可以用 toast/訊息提示使用者
                return;
            }

            // 偵測重複
            const isDuplicate = this.dz.files.find(f =>
                f.name === file.name &&
                f.size === file.size &&
                f != file
            );
            if (isDuplicate) {
                this.dz.removeFile(file);
                alert("這張圖片已經加入過了");   // HACK: 這裡可以用 toast/訊息提示使用者
                return;
            }

            // 設定變更偵測策略
            // 這是原版
            // this.files.push(file);
            // this.emitFiles();
            // 這是 OnPush 版
            this.ngZone.run(() => {
                // 更新資料
                this.files.push(file);
                this.emitFiles();
                // 若模板有依賴 files 長度或內容，需要刷新
                this.cdr.markForCheck();
            });

            // 隱藏動畫覆蓋
            this.hideSpinner(file);
        });

        // 事件：移除檔案
        this.dz.on('removedfile', (file: File) => {
            // 設定變更偵測策略
            // 這是原版
            // this.files = this.files.filter(f => f !== file);
            // 同步移除後的 DOM 順序
            // this.syncFilesOrder();
            // 這是 OnPush 版
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
                // 設定變更偵測策略
                // 這是原版
                // this.syncFilesOrder();
                // 這是 OnPush 版
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
        const ordered: File[] = [];

        // 先把 Dropzone 已接受的檔案列出來，以便比對 previewElement
        const pool = this.dz.getAcceptedFiles();

        for (const el of previews) {
            const f = pool.find(x => (x as any).previewElement === el);
            if (f) ordered.push(f);
        }

        // 若有缺（例如動畫中），保底補回
        for (const f of pool) {
            if (!ordered.includes(f)) ordered.push(f);
        }

        this.files = ordered;
        this.emitFiles();
    }

    // Dropzone
    // 輸出 File 原生物件列表
    private emitFiles() {
        this.filesChanged.emit([...this.files]);
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
