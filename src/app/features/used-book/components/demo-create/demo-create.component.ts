import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-ub-demo-create',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './demo-create.component.html',
    styleUrl: './demo-create.component.css'
})
export class DemoCreateComponent {

    // UI 用表單
    form = new FormGroup({
        account: new FormControl('', { nonNullable: true, validators: Validators.required }),
        password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
        info: new FormGroup({
            age: new FormControl<number | null>(null),
            tall: new FormControl<number | null>(null),
        }),
        address: new FormArray([
            new FormControl(''),
            new FormControl(''),
        ]),
        images: new FormArray<FormControl<File>>([]),
    })

    // 後端來的資料 snap-shot
    origForm = new FormGroup({
        account: new FormControl('', { nonNullable: true }),
        password: new FormControl('', { nonNullable: true }),
        info: new FormGroup({
            age: new FormControl<number | null>(null),
            tall: new FormControl<number | null>(null),
        }),
        address: new FormArray([
            new FormControl(''),
            new FormControl(''),
        ]),
    })

    // 取得後端資料並載入 origForm
    getFromBackEnd() {
        this.origForm.patchValue({
            account: 'oldBoy',
            password: 'not string enough',
            info: {
                age: 45
            },
            address: ['add'],
        });
    }

    ngOnInit(): void {
        this.getFromBackEnd();
        this.form.patchValue(this.origForm.getRawValue());
    }

    getAddress() {
        return (this.form.get('address') as FormArray).controls;
    }

    addAddress() {
        (this.form.get("address") as FormArray)
            .push(new FormControl('新的預設值'));
    }

    submit() {
        console.log(this.form);
        console.log(this.form.value);
    }

    reset() {
        this.form.reset(this.origForm.getRawValue());
    }

    // 方便取用
    get imagesFA() {
        return this.form.controls.images as FormArray<FormControl<File>>;
    }

    // 由 uploader 事件同步到表單
    onImagesChanged(files: File[]) {
        // 1) 先清空
        while (this.imagesFA.length) this.imagesFA.removeAt(0);
        // 2) 依序加入（排序已由 uploader 決定）
        files.forEach(f => this.imagesFA.push(new FormControl(f, { nonNullable: true })));
        this.imagesFA.markAsDirty();
        this.imagesFA.updateValueAndValidity();
        console.log(this.form.get('images'));
    }
}

type DemoCreateForm = FormGroup<{
    account: FormControl<string>;
    password: FormControl<string>;
    info: FormGroup<{
        age: FormControl<number | null>;
        tall: FormControl<string | null>;
    }>;
    address: FormArray<FormControl<string>>;
}>;
