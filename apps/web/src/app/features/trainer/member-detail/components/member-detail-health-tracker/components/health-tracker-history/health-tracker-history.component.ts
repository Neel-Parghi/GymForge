import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-health-tracker-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-tracker-history.component.html',
  styleUrl: './health-tracker-history.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    style: 'display: contents;'
  }
})
export class HealthTrackerHistoryComponent {
  @Input() measurements: any[] = [];

  @Output() openDetails = new EventEmitter<any>();
  @Output() recordNewEntry = new EventEmitter<void>();

  getBmiClass(bmi: number | undefined): string {
    if (!bmi) return 'empty';
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  getBmiText(bmi: number | undefined): string {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }
}
