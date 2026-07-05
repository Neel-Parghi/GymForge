import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-detail-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-detail-overview.component.html',
  styleUrl: './member-detail-overview.component.scss',
})
export class PTMemberDetailOverviewComponent {
  @Input() memberInfo: any = null;
  @Input() workoutHistory: any[] = [];
  @Input() measurements: any[] = [];
  @Input() activeSplit: any = null;
  @Input() activeDiet: any = null;

  @Output() changeTab = new EventEmitter<any>();

  get statusClass(): string {
    const status = this.memberInfo?.status;
    if (status === undefined || status === null) return 'unknown';
    if (typeof status === 'string') return status.toLowerCase();

    switch (status) {
      case 1: return 'active';
      case 2: return 'inactive';
      case 3: return 'expired';
      case 4: return 'expired';
      case 5: return 'pending';
      default: return 'unknown';
    }
  }

  get statusLabel(): string {
    const status = this.memberInfo?.status;
    if (status === undefined || status === null) return 'Unknown';
    if (typeof status === 'string') return status;

    switch (status) {
      case 1: return 'Active';
      case 2: return 'Inactive';
      case 3: return 'Frozen';
      case 4: return 'Expired';
      case 5: return 'Pending';
      default: return 'Unknown';
    }
  }

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

  get activeDaysPerWeek(): number {
    if (!this.activeSplit || !this.activeSplit.days) return 3;
    return this.activeSplit.days.filter((d: any) => !d.isRestDay).length;
  }

  get monthlySessionTarget(): number {
    return this.activeDaysPerWeek * 4;
  }

  get monthlyCompletionPct(): number {
    const target = this.monthlySessionTarget;
    if (target === 0) return 0;
    return Math.min(100, Math.round((this.monthlySessionCount / target) * 100));
  }

  get completionFeedback(): string {
    const pct = this.monthlyCompletionPct;
    if (pct === 0) return "Log a session to kick off this month!";
    if (pct < 25) return "Good start, keep up the momentum!";
    if (pct < 50) return "On track! Keep pushing towards the target.";
    if (pct < 75) return "Great progress! More than halfway there.";
    if (pct < 100) return "Almost there! Just a few more sessions.";
    return "Goal achieved! Exceptional dedication this month!";
  }

  get daysLeftLabel(): string {
    if (!this.memberInfo || !this.memberInfo.endDate) return 'Ongoing PT Package';
    const endDate = new Date(this.memberInfo.endDate);
    if (isNaN(endDate.getTime())) return 'Ongoing PT Package';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareEnd = new Date(endDate);
    compareEnd.setHours(0, 0, 0, 0);

    const diffTime = compareEnd.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'PT Package Expired';
    if (diffDays === 0) return 'PT Package Ends Today';
    if (diffDays === 1) return '1 day left in PT Package';
    return `${diffDays} days left in PT Package`;
  }

  get isEndingSoon(): boolean {
    if (!this.memberInfo || !this.memberInfo.endDate) return false;
    const endDate = new Date(this.memberInfo.endDate);
    if (isNaN(endDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareEnd = new Date(endDate);
    compareEnd.setHours(0, 0, 0, 0);

    const diffTime = compareEnd.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= 7;
  }

  get isExpired(): boolean {
    if (!this.memberInfo || !this.memberInfo.endDate) return false;
    const endDate = new Date(this.memberInfo.endDate);
    if (isNaN(endDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareEnd = new Date(endDate);
    compareEnd.setHours(0, 0, 0, 0);

    return compareEnd.getTime() < today.getTime();
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
