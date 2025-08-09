import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-test',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './test.component.html',
    styleUrl: './test.component.css'
})
export class TestComponent {
    goToSignUp() {
        this.router.navigate(['used-books/test/89757']);
    }
    text: string = '';

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {
        console.log('params', this.activatedRoute.snapshot);
        console.log('params', this.activatedRoute.snapshot.params['id']);
        console.log('params', this.activatedRoute.snapshot.paramMap.get('id'));
    }
}
