import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-detail-diet-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-detail-diet-chart.html',
  styleUrl: './member-detail-diet-chart.scss',
})
export class PTMemberDetailDietChartComponent {
  @Input() activeDiet: any = null;
  @Output() openAssignModal = new EventEmitter<void>();

  onOpenAssignModal(): void {
    this.openAssignModal.emit();
  }
}
