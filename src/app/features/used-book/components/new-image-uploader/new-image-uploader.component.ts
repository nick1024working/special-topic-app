import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import Dropzone from 'dropzone';
import Sortable from 'sortablejs';

Dropzone.autoDiscover = false;

@Component({
    selector: 'app-ub-new-image-uploader',
    standalone: true,
    templateUrl: './new-image-uploader.component.html',
    styleUrl: './new-image-uploader.component.css'
})
export class NewImageUploaderComponent implements AfterViewInit, OnDestroy {
    @ViewChild('box') boxRef!: ElementRef<HTMLDivElement>;
    @Output() filesChanged = new EventEmitter<File[]>();

    dz!: Dropzone;

    ngAfterViewInit(): void {
        const box = this.boxRef.nativeElement;

        // Dropzone：點擊/拖放到同一個容器；預覽也渲染在同容器
        this.dz = new Dropzone(box, {
            url: '/noop',
            autoProcessQueue: false,
            clickable: box,
            previewsContainer: box,
            acceptedFiles: 'image/*',
            maxFiles: 9,
            addRemoveLinks: false,
            dictDefaultMessage: '拖曳圖片或點擊上傳（最多 9 張）',
            previewTemplate: `
        <div class="dz-preview dz-file-preview card">
          <img data-dz-thumbnail class="thumb"/>
          <button class="btn-remove" data-dz-remove aria-label="刪除">✕</button>
          <div class="drag-handle" title="拖曳排序" aria-label="拖曳排序">⋮⋮⋮</div>
        </div>`
        });

        const emitFiles = () => this.filesChanged.emit(this.dz.files as unknown as File[]);
        this.dz.on('addedfile', emitFiles);
        this.dz.on('removedfile', emitFiles);

        // Sortable：直接綁在同一容器；用原生 DnD（不要 forceFallback）
        Sortable.create(box, {
            animation: 150,
            draggable: '.dz-preview',
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',   // 留在清單中的佔位
            chosenClass: 'sortable-chosen', // 被選起來的原項目
            filter: '.btn-remove,[data-dz-remove]', // 點刪除不觸發拖曳
            preventOnFilter: false,
            onSort: () => {
                // 依 DOM 重新排 Dropzone files
                const ordered = Array.from(box.querySelectorAll<HTMLElement>('.dz-preview'))
                    .map((el: any) => el.file as File);
                (this.dz as any).files = ordered;
                emitFiles();
            }
        });
    }

    ngOnDestroy(): void {
        try { this.dz?.destroy?.(); } catch { /* noop */ }
    }
}
