import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WinterArcStore } from '../winter-arc.store';
import { ArcDay } from '../winter-arc.models';
import { ARC_KEPT_THRESHOLD, ARC_SEASON_END, ARC_SEASON_START } from '../winter-arc.mock';

@Component({
  selector: 'app-arc-home',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './arc-home.component.html',
  styleUrl: './arc-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArcHomeComponent {
  readonly store = inject(WinterArcStore);

  readonly seasonStart = ARC_SEASON_START;
  readonly seasonEnd = ARC_SEASON_END;
  readonly keptThreshold = ARC_KEPT_THRESHOLD;

  readonly seasonProgress = Math.round((this.store.dayOfSeason / this.store.totalDays) * 100);

  readonly today = this.store.todayRecord;
  readonly stats = this.store.stats;
  readonly week = this.store.week;

  readonly habitRows = computed(() => {
    const day = this.today();
    return this.store.habits().map(habit => ({
      habit,
      done: day.habits[habit.id] ?? false,
      weekCount: this.week().filter(d => d?.habits[habit.id]).length
    }));
  });

  readonly habitPoints = computed(() => {
    const habits = this.store.habits().length;
    return habits ? Math.round(this.store.weights().habits * this.today().habitsDone / habits) : 0;
  });

  readonly proteinPct = Math.min(100, Math.round(this.store.todayDetail.protein.eaten / this.store.todayDetail.protein.target * 100));
  readonly caloriesPct = Math.min(100, Math.round(this.store.todayDetail.calories.eaten / this.store.todayDetail.calories.target * 100));

  /** Most recent missed day this week that a freeze can still cover. */
  readonly freezeCandidate = computed(() =>
    [...this.week()].reverse().find((d): d is ArcDay => !!d && d.canFreeze) ?? null
  );

  toggleHabit(habitId: string): void {
    this.store.toggleHabit(this.today(), habitId);
  }

  freeze(day: ArcDay): void {
    this.store.freeze(day);
  }

  weekCellClass(day: ArcDay | null): string {
    if (!day || day.status === 'future') return 'future';
    if (day.status === 'frozen') return 'frozen';
    if (day.kept) return 'kept';
    return day.status === 'today' ? 'today' : 'missed';
  }
}
