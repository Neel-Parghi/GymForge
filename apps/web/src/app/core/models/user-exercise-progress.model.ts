export type ProgressRange = '1M' | '3M' | '6M' | 'All';

export interface ProgressSessionRow {
  date: string;
  weight: number;
  reps: number;
  isPr: boolean;
  deltaLabel: string;
  deltaClass: 'up' | 'down' | 'neutral';
}
