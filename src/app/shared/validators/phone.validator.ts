import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
    const regex = /^09\d{8}$/;
    return (control: AbstractControl): ValidationErrors | null => {
        // 跳過空值 (交給 required)
        if (!control.value)
            return null;
        return regex.test(control.value) ? null : { invalidPhone: true };
    };
}
