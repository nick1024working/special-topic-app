import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'capitalize',
    standalone: true
})
export class CapitalizePipe implements PipeTransform {

    transform(value: string, format: string = '...'): string {
        if (!value)
            return '';
        if (format === '...')
            return value + '...';
        if (format === 'ALL')
            return value.toUpperCase();
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

}
