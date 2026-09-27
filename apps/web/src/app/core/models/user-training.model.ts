import { ActivePlanDay } from '../../shared/models/workout-plan.model';

export type TrainingView = 'plan' | 'library';

export interface TrainingDay {
  date: Date;
  tag: string;
  isToday: boolean;
  isFuture: boolean;
  logged: 'done' | 'rest' | null;
  day: ActivePlanDay | null;
}

export interface DayExercise {
  name: string;
  sets: number;
  reps: string;
  notes: string;
}

export type CtaKind = 'start' | 'log' | 'view';
