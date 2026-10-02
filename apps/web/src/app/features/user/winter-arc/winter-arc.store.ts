import { Injectable, computed, signal } from '@angular/core';
import { toDateKey } from '../../../shared/utils/workout-schedule';
import { ArcDay, ArcHabit, ArcStats } from './winter-arc.models';
import {
  ARC_DEFAULT_HABITS, ARC_DEMO_TODAY, ARC_EDITABLE_DAYS, ARC_FREEZES_PER_MONTH, ARC_KEPT_THRESHOLD,
  ARC_POINTS, ARC_SAMPLE_FROZEN, ARC_SEASON_DAYS, ARC_SEASON_START, ARC_TODAY_DETAIL, arcSampleRandom
} from './winter-arc.mock';

const DAY_MS = 24 * 60 * 60 * 1000;
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * In-memory Winter Arc state for the beta UI, scoped to the module's routes. Sample history comes
 * from winter-arc.mock.ts; ticks, freezes and joining live only until the page reloads.
 */
@Injectable()
export class WinterArcStore {
  readonly today = ARC_DEMO_TODAY;
  readonly todayDetail = ARC_TODAY_DETAIL;
  readonly totalDays = ARC_SEASON_DAYS;
  readonly dayOfSeason = this.seasonIndex(ARC_DEMO_TODAY);
  readonly daysLeft = ARC_SEASON_DAYS - this.dayOfSeason;

  readonly joined = signal(false);
  readonly trackNutrition = signal(true);
  readonly habits = signal<ArcHabit[]>(ARC_DEFAULT_HABITS);
  private readonly ticks = signal<Record<string, boolean>>({});
  private readonly frozenKeys = signal<string[]>(ARC_SAMPLE_FROZEN);

  /** Points per goal, rescaled to 100 when nutrition isn't tracked. */
  readonly weights = computed(() => {
    const track = this.trackNutrition();
    const raw = { ...ARC_POINTS, protein: track ? ARC_POINTS.protein : 0, calories: track ? ARC_POINTS.calories : 0 };
    const factor = 100 / (raw.trained + raw.protein + raw.calories + raw.habits);
    return {
      trained: raw.trained * factor,
      protein: raw.protein * factor,
      calories: raw.calories * factor,
      habits: raw.habits * factor
    };
  });

  readonly days = computed<ArcDay[]>(() => {
    const days = Array.from({ length: ARC_SEASON_DAYS }, (_, i) => this.buildDay(i + 1));
    const frozenPerMonth = this.frozenPerMonth();
    return days.map(d => ({
      ...d,
      canFreeze: d.status === 'past' && !d.kept && (frozenPerMonth[d.date.getMonth()] ?? 0) < ARC_FREEZES_PER_MONTH
    }));
  });

  readonly todayRecord = computed(() => this.days()[this.dayOfSeason - 1]);

  /** Monday-to-Sunday week around today; days outside the season come back as null. */
  readonly week = computed<(ArcDay | null)[]>(() => {
    const monday = new Date(this.today);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const index = this.seasonIndex(date);
      return index >= 1 && index <= ARC_SEASON_DAYS ? this.days()[index - 1] : null;
    });
  });

  readonly stats = computed<ArcStats>(() => {
    const days = this.days();
    const counted = days.filter(d => d.status === 'past');
    const total = counted.reduce((sum, d) => sum + (d.points ?? 0), 0);

    let streak = this.todayRecord().kept ? 1 : 0;
    for (let i = this.dayOfSeason - 2; i >= 0; i--) {
      const day = days[i];
      if (day.status === 'frozen') continue;
      if (!day.kept) break;
      streak++;
    }

    return {
      score: counted.length ? Math.round(total / counted.length) : 0,
      streak,
      keptDays: counted.filter(d => d.kept).length,
      countedDays: counted.length,
      freezesLeft: ARC_FREEZES_PER_MONTH * 3 - this.frozenKeys().length
    };
  });

  join(habitNames: string[], trackNutrition: boolean): void {
    this.habits.set(habitNames.map((name, i) => ({ id: `h${i + 1}`, name })));
    this.trackNutrition.set(trackNutrition);
    this.ticks.set({});
    this.joined.set(true);
  }

  toggleHabit(day: ArcDay, habitId: string): void {
    if (!day.editable) return;
    const key = `${day.key}|${habitId}`;
    this.ticks.update(t => ({ ...t, [key]: !day.habits[habitId] }));
  }

  freeze(day: ArcDay): void {
    if (day.canFreeze) this.frozenKeys.update(keys => [...keys, day.key]);
  }

  freezesLeftIn(month: number): number {
    return ARC_FREEZES_PER_MONTH - (this.frozenPerMonth()[month] ?? 0);
  }

  private frozenPerMonth(): Record<number, number> {
    const counts: Record<number, number> = {};
    for (const key of this.frozenKeys()) {
      const month = Number(key.slice(5, 7)) - 1;
      counts[month] = (counts[month] ?? 0) + 1;
    }
    return counts;
  }

  private buildDay(index: number): ArcDay {
    const date = new Date(ARC_SEASON_START);
    date.setDate(date.getDate() + index - 1);
    const key = toDateKey(date);
    const daysAgo = this.dayOfSeason - index;

    const base: ArcDay = {
      key, date, dayOfMonth: date.getDate(), dow: DOW[(date.getDay() + 6) % 7],
      status: 'future', trained: null, protein: null, calories: null,
      habits: {}, habitsDone: 0, points: null, kept: false, editable: false, canFreeze: false
    };
    if (daysAgo < 0) return base;
    if (daysAgo > 0 && this.frozenKeys().includes(key)) return { ...base, status: 'frozen' };

    const isToday = daysAgo === 0;
    const trained = isToday ? 'done' : date.getDay() === 0 ? 'rest' : arcSampleRandom(index, 0) < 0.16 ? 'missed' : 'done';
    const protein = isToday ? false : arcSampleRandom(index, 1) > 0.3;
    const calories = isToday ? true : arcSampleRandom(index, 2) > 0.25;

    const ticks = this.ticks();
    const habitList = this.habits();
    const habits: Record<string, boolean> = {};
    habitList.forEach((habit, j) => {
      const ticked = ticks[`${key}|${habit.id}`];
      habits[habit.id] = ticked ?? (!isToday && arcSampleRandom(index, j + 3) > 0.25 + (j % 6) * 0.06);
    });
    const habitsDone = Object.values(habits).filter(Boolean).length;

    const w = this.weights();
    const nutrition = this.trackNutrition();
    const points = Math.round(
      (trained !== 'missed' ? w.trained : 0)
      + (nutrition && protein ? w.protein : 0)
      + (nutrition && calories ? w.calories : 0)
      + (habitList.length ? w.habits * habitsDone / habitList.length : 0)
    );

    return {
      ...base,
      status: isToday ? 'today' : 'past',
      trained, protein, calories, habits, habitsDone, points,
      kept: points >= ARC_KEPT_THRESHOLD,
      editable: daysAgo < ARC_EDITABLE_DAYS
    };
  }

  private seasonIndex(date: Date): number {
    const start = new Date(ARC_SEASON_START.getFullYear(), ARC_SEASON_START.getMonth(), ARC_SEASON_START.getDate());
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.round((day.getTime() - start.getTime()) / DAY_MS) + 1;
  }
}
