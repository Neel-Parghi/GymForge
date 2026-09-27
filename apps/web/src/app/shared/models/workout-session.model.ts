import { FormArray, FormControl, FormGroup } from '@angular/forms';

/** Workout handed in by Track Performance (loosely typed: sets may carry '' for an empty weight). */
export interface SessionWorkoutInput {
  dayName: string;
  isRestDay: boolean;
  exercises: {
    name: string;
    skipped?: boolean;
    isCardio?: boolean;
    sets: { setNo?: number; target?: string; weight?: number | string | null; reps?: number | string | null; completed?: boolean }[];
  }[];
}

export interface PlanDayOption {
  dayName: string;
  isRestDay?: boolean;
  category?: string;
  exercises?: { name: string; sets?: number | string; reps?: string }[];
}

export interface SessionSetValue {
  setNo: number;
  target: string;
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface SessionExerciseValue {
  name: string;
  isCardio: boolean;
  skipped: boolean;
  sets: SessionSetValue[];
}

export interface SessionWorkoutResult {
  dayName: string;
  isRestDay: boolean;
  exercises: SessionExerciseValue[];
}

export type SessionSetForm = FormGroup<{
  setNo: FormControl<number>;
  target: FormControl<string>;
  weight: FormControl<number | null>;
  reps: FormControl<number | null>;
  completed: FormControl<boolean>;
}>;

export type SessionExerciseForm = FormGroup<{
  name: FormControl<string>;
  isCardio: FormControl<boolean>;
  skipped: FormControl<boolean>;
  sets: FormArray<SessionSetForm>;
}>;

export type SessionSheet = 'exercises' | 'add' | 'swap' | 'days' | null;

export type SetField = 'weight' | 'reps';

export interface LastPerformance {
  summary: string;
  sets: { weight: number; reps: number }[];
}
