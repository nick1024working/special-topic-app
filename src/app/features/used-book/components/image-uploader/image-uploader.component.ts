import {
    Component, ViewChild, ElementRef, AfterViewInit, OnDestroy,
    Output, EventEmitter
} from '@angular/core';
import Dropzone from 'dropzone';
import Sortable from 'sortablejs';

@Component({
    selector: 'app-ub-image-uploader',
    templateUrl: './image-uploader.component.html',
    styleUrls: [
        './image-uploader.component.css',
    ],
    standalone: true
})
export class ImageUploaderComponent implements AfterViewInit, OnDestroy {
    @ViewChild('dz') dzElem!: ElementRef<HTMLDivElement>;
    @Output() filesChanged = new EventEmitter<File[]>();

    dz!: Dropzone;
    files: File[] = [];

    ngAfterViewInit() {
        /** --- ❶ 自訂 preview 樣板 --- */
        const previewTemplate = `
      <div class="dz-preview dz-file-preview position-relative m-2">
        <img data-dz-thumbnail class="img-thumb"/>
        <!-- draggable handle -->
        <div class="drag-handle position-absolute top-0 start-0 text-muted">
          <i class="bi bi-grip-vertical fs-5"></i>
        </div>
        <!-- remove btn -->
        <button data-dz-remove
                class="btn btn-sm btn-danger position-absolute top-0 end-0">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>`;

        /** --- ❷ Dropzone 設定 --- */
        this.dz = new Dropzone(this.dzElem.nativeElement, {
            url: '/noop',
            autoProcessQueue: false,
            previewsContainer: this.dzElem.nativeElement,
            clickable: true,
            acceptedFiles: 'image/*',
            maxFiles: 9,
            previewTemplate,
            addRemoveLinks: false,        // 我們自己給 remove btn
            dictDefaultMessage: '拖曳圖片或點擊上傳（最多 9 張）'
        });

        // ❸ 新增 / 移除 檔案事件
        this.dz.on('addedfile', file => {
            this.files.push(file);
            this.filesChanged.emit(this.files);
        });
        this.dz.on('removedfile', file => {
            this.files = this.files.filter(f => f !== file);
            this.filesChanged.emit(this.files);
        });

        /** --- ❹ Sortable 綁定到 Dropzone 預覽容器 --- */
        Sortable.create(this.dzElem.nativeElement, {
            animation: 150,
            draggable: '.dz-preview',
            handle: '.drag-handle',
            chosenClass: 'sortable-chosen',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            forceFallback: true,
            fallbackOnBody: false,
            onEnd: () => {
                const ordered: File[] = [];
                this.dzElem.nativeElement
                    .querySelectorAll('.dz-preview')
                    .forEach((el: any) => ordered.push(el.file));
                this.files = ordered;
                this.filesChanged.emit(this.files);
            }
        });

    }

    ngOnDestroy() {
        this.dz?.destroy?.();
    }
}
