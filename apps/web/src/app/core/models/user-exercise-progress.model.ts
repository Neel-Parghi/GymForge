import { ChangeDir, ProgressChange } from '../../shared/utils/workout-progress';

export type ProgressRange = '1M' | '3M' | '6M' | 'All';

export type ProgressView = 'compare' | 'history' | 'trend';

export interface ProgressSessionRow {
  date: string;
  weight: number;
  reps: number;
  isPr: boolean;
  deltaLabel: string;
  deltaClass: 'up' | 'down' | 'neutral';
}

export interface ProgressHistoryRow {
  date: string;
  dayName: string;
  volume: string;
  sets: { label: string; isPr: boolean }[];
  change: ProgressChange | null;
}

export interface LastSessionSetRow {
  setNo: number;
  weight: string;
  reps: number;
  change: ProgressChange;
}

export interface CompareCell {
  weight: string;
  reps: string;
  isPr: boolean;
  isEmpty: boolean;
}

export interface CompareTotal {
  text: string;
  dir: ChangeDir;
}

export interface CompareColumn {
  date: string;
  isLatest: boolean;
  cells: CompareCell[];
  totals: CompareTotal[];
}

export interface GroupExerciseCard {
  name: string;
  date: string;
  summary: string;
  sets: { setNo: number; label: string; isPr: boolean }[];
  comparedTo: string | null;
  change: ProgressChange | null;
  isNewPersonalBest: boolean;
  spark: string;
  sparkDir: ChangeDir;
}
