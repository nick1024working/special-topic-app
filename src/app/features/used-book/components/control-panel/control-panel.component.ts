import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-ub-control-panel',
    standalone: true,
    imports: [],
    templateUrl: './control-panel.component.html',
    styleUrls: ['./control-panel.component.css', '../../styles/bs-custom-override.scss',]
})
export class ControlPanelComponent {
    isOpen = signal(false);

    togglePanel(btn: HTMLButtonElement) {
        this.isOpen.update(v => !v);
        btn.blur();
    }
}
