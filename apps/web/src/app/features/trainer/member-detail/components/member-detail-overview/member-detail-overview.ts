import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-detail-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-detail-overview.html',
  styleUrl: './member-detail-overview.scss',
})
export class PTMemberDetailOverviewComponent {
  @Input() memberInfo: any = null;
  @Input() workoutHistory: any[] = [];
  @Input() measurements: any[] = [];
  @Input() activeSplit: any = null;
  @Input() activeDiet: any = null;

  @Output() changeTab = new EventEmitter<any>();

  get monthlySessionCount(): number {
    const now = new Date();
    return this.workoutHistory.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }

  get totalSetsThisMonth(): number {
    const now = new Date();
    return this.workoutHistory
      .filter(s => {
        const d = new Date(s.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, s) => sum + (s.totalSets || 0), 0);
  }

  get currentStreak(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const has = this.workoutHistory.some(s => new Date(s.date).toDateString() === d.toDateString());
      if (has) { streak++; } else if (i > 0) { break; }
    }
    return streak;
  }

  get bodyFatRingPct(): number {
    const bf = this.measurements[0]?.bodyFatPercentage;
    if (!bf) return 0;
    return Math.min(100, Math.round((bf / 35) * 100));
  }

  get bmiRingPct(): number {
    const bmi = this.measurements[0]?.bmi;
    if (!bmi) return 0;
    return Math.min(100, Math.max(0, Math.round(((bmi - 15) / 20) * 100)));
  }

  bmiRingStyle(pct: number): string {
    const c = 283;
    return `${Math.round(pct / 100 * c)} ${c}`;
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

  setTab(tab: any): void {
    this.changeTab.emit(tab);
  }
}
