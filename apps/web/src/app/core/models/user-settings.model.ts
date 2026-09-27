import { FormControl, FormGroup } from '@angular/forms';

export interface GoalOption {
  value: string;
  label: string;
  hint: string;
  icon: string;
}

export interface FitnessForm {
  primaryGoal: FormControl<string>;
  targetWeight: FormControl<number | null>;
  targetCalories: FormControl<number | null>;
  targetTrainingTime: FormControl<number | null>;
  targetProtein: FormControl<number | null>;
  targetCarbs: FormControl<number | null>;
  targetFats: FormControl<number | null>;
}

export interface NotificationsForm {
  emailNotifications: FormControl<boolean>;
  workoutReminders: FormControl<boolean>;
}

export interface UserPreferences {
  primaryGoal?: string;
  targetWeight?: number | null;
  targetCalories?: number | null;
  targetProtein?: number | null;
  targetCarbs?: number | null;
  targetFats?: number | null;
  targetTrainingTime?: number | null;
  emailNotificationsEnabled?: boolean;
  workoutRemindersEnabled?: boolean;
}

export type FitnessValue = ReturnType<FormGroup<FitnessForm>['getRawValue']>;
