import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterActive',
  standalone: true
})
export class FilterActivePipe implements PipeTransform {
  transform(items: any[] | null): any[] {
    if (!items) return [];
    return items.filter(item => item.status === 1 || item.isActive === true);
  }
}
