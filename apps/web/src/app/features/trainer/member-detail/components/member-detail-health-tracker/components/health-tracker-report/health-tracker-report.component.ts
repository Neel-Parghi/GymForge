import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-health-tracker-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-tracker-report.component.html',
  styleUrl: './health-tracker-report.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    style: 'display: contents;'
  }
})
export class HealthTrackerReportComponent {
  @Input() selectedLog: any = null;
  @Input() previousLog: any = null;

  @Output() close = new EventEmitter<void>();

  closeDetailsDrawer(): void {
    this.close.emit();
  }

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

  getDelta(current: number | undefined | null, previous: number | undefined | null): { value: string, class: string, icon: string } | null {
    if (current === undefined || current === null || previous === undefined || previous === null) {
      return null;
    }
    const diff = Math.round((current - previous) * 10) / 10;
    if (diff === 0) {
      return { value: '0', class: 'delta-neutral', icon: 'fa-minus' };
    }
    const formatted = diff > 0 ? `+${diff}` : `${diff}`;
    const isPositive = diff > 0;
    return {
      value: formatted,
      class: isPositive ? 'delta-positive' : 'delta-negative',
      icon: isPositive ? 'fa-arrow-up' : 'fa-arrow-down'
    };
  }
}
