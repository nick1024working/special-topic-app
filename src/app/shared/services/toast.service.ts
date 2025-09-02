import { Injectable, signal } from '@angular/core';
import { ToastItem, ToastOptions } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts = signal<ToastItem[]>([]);

    private defaultOpt: Required<ToastOptions> = {
        delay: 3000,
        autohide: true,
        header: '',
        level: 'primary',
    };

    show(body: string, options: ToastOptions = {}) {
        const id = crypto.randomUUID?.()
            ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
        const toast: ToastItem = { id, body, ...this.defaultOpt, ...options };
        this.toasts.update(list => [toast, ...list]);
        return id;
    }

    remove(id: string) {
        this.toasts.update(list => list.filter(t => t.id !== id));
    }

    clear() {
        this.toasts.set([]);
    }

    // 便捷方法
    success(msg: string, opt: ToastOptions = {}) { return this.show(msg, { level: 'success', ...opt }); }
    info(msg: string, opt: ToastOptions = {}) { return this.show(msg, { level: 'info', ...opt }); }
    warn(msg: string, opt: ToastOptions = {}) { return this.show(msg, { level: 'warning', ...opt }); }
    error(msg: string, opt: ToastOptions = {}) { return this.show(msg, { level: 'danger', ...opt }); }
    light(msg: string, opt: ToastOptions = {}) { return this.show(msg, { level: 'light', ...opt }); }
}
