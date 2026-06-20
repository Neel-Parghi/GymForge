import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  /**
   * Truncates a string to a specified limit and appends an ellipsis.
   * @param value The string to truncate.
   * @param limit The maximum number of characters allowed.
   * @param completeWords If true, truncates at word boundaries rather than mid-word.
   * @param ellipsis The string to append to the truncated text (defaults to '...').
   */
  transform(value: string | null | undefined, limit: number = 25, completeWords: boolean = false, ellipsis: string = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;

    if (completeWords) {
      const truncated = value.substring(0, limit);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 0) {
        return truncated.substring(0, lastSpace) + ellipsis;
      }
    }

    return value.substring(0, limit) + ellipsis;
  }
}
