import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SegmentedTab } from '../../models/segmented-tab.model';

@Component({
  selector: 'app-segmented-tabs',
  standalone: true,
  templateUrl: './segmented-tabs.component.html',
  styleUrl: './segmented-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SegmentedTabsComponent {
  readonly tabs = input.required<SegmentedTab[]>();
  readonly active = input.required<string>();
  readonly label = input<string>('Sections');
  readonly selected = output<string>();

  select(id: string): void {
    if (id !== this.active()) {
      this.selected.emit(id);
    }
  }
}
