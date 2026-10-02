export interface ArcHabit {
  id: string;
  name: string;
}

export type ArcTrained = 'done' | 'rest' | 'missed';

export type ArcDayStatus = 'past' | 'today' | 'future' | 'frozen';

export interface ArcDay {
  key: string;
  date: Date;
  dayOfMonth: number;
  /** Single-letter weekday, Monday first. */
  dow: string;
  status: ArcDayStatus;
  trained: ArcTrained | null;
  protein: boolean | null;
  calories: boolean | null;
  /** Habit id -> ticked. Empty for future and frozen days. */
  habits: Record<string, boolean>;
  habitsDone: number;
  points: number | null;
  kept: boolean;
  /** Habits can still be ticked (today and the two days before). */
  editable: boolean;
  canFreeze: boolean;
}

export interface ArcStats {
  score: number;
  streak: number;
  keptDays: number;
  countedDays: number;
  freezesLeft: number;
}

export interface ArcMonth {
  /** JS month index: 9 = October. */
  month: number;
  label: string;
}
