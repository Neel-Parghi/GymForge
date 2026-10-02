import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WinterArcStore } from '../winter-arc.store';
import { ArcDay, ArcHabit } from '../winter-arc.models';
import { ARC_EDITABLE_DAYS, ARC_KEPT_THRESHOLD, ARC_MONTHS, ARC_SEASON_END, ARC_SEASON_START } from '../winter-arc.mock';

type CellTone = 'done' | 'rest' | 'missed' | 'open' | 'frozen' | 'future';

interface PlannerCell {
  day: ArcDay;
  tone: CellTone;
  label: string;
  isToday: boolean;
}

interface PlannerRow {
  name: string;
  cells: PlannerCell[];
}

@Component({
  selector: 'app-arc-planner',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './arc-planner.component.html',
  styleUrl: './arc-planner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArcPlannerComponent {
  readonly store = inject(WinterArcStore);

  readonly months = ARC_MONTHS;
  readonly seasonStart = ARC_SEASON_START;
  readonly seasonEnd = ARC_SEASON_END;
  readonly editableDays = ARC_EDITABLE_DAYS;
  readonly keptThreshold = ARC_KEPT_THRESHOLD;
  readonly stats = this.store.stats;

  readonly month = signal(this.store.today.getMonth());

  readonly days = computed(() => this.store.days().filter(d => d.date.getMonth() === this.month()));

  readonly autoRows = computed<PlannerRow[]>(() => {
    const rows: PlannerRow[] = [{
      name: 'Trained',
      cells: this.days().map(day => this.cell(day, day.trained === 'rest' ? 'rest' : day.trained === 'done'))
    }];
    if (this.store.trackNutrition()) {
      rows.push({ name: 'Protein', cells: this.days().map(day => this.cell(day, day.protein)) });
      rows.push({ name: 'Calories', cells: this.days().map(day => this.cell(day, day.calories)) });
    }
    return rows;
  });

  readonly habitRows = computed(() => this.store.habits().map(habit => ({
    habit,
    cells: this.days().map(day => this.habitCell(day, habit))
  })));

  readonly freezesLeftThisMonth = computed(() => this.store.freezesLeftIn(this.month()));

  toggle(cell: PlannerCell, habit: ArcHabit): void {
    this.store.toggleHabit(cell.day, habit.id);
  }

  freeze(day: ArcDay): void {
    this.store.freeze(day);
  }

  private cell(day: ArcDay, value: boolean | 'rest' | null): PlannerCell {
    const isToday = day.status === 'today';
    if (day.status === 'future') return { day, tone: 'future', label: '', isToday };
    if (day.status === 'frozen') return { day, tone: 'frozen', label: '', isToday };
    if (value === 'rest') return { day, tone: 'rest', label: 'R', isToday };
    return { day, tone: value ? 'done' : 'missed', label: value ? '✓' : '', isToday };
  }

  private habitCell(day: ArcDay, habit: ArcHabit): PlannerCell {
    const done = day.habits[habit.id];
    const base = this.cell(day, done);
    return day.editable && !done && base.tone === 'missed' ? { ...base, tone: 'open' } : base;
  }
}
