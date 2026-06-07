export type WorkoutPlanType = 'Split' | 'Weekly' | 'Daily';

export interface PlannerExercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

export interface SplitDay {
  id?: string;
  name: string;
  category: string;
  exercises: PlannerExercise[];
}

export interface BaseWorkoutPlan {
  id?: string;
  name: string;
  description: string;
  level: string;
  goal: string;
  type: WorkoutPlanType;
  gymId?: string;
  isCustom?: boolean;
  daysCount?: number;
  exercisesCount?: number;
  createdAt?: Date;
}

export interface SplitPlanner extends BaseWorkoutPlan {
  type: 'Split';
  days: SplitDay[];
}

export interface WeeklyDayPlan {
  id?: string;
  dayName: string;
  type: 'workout' | 'rest';
  targetCategory?: string;
  splitDayName?: string;
  exercises: PlannerExercise[];
}

export interface WeeklyPlanner extends BaseWorkoutPlan {
  type: 'Weekly';
  activeDaysCount: number;
  calendar: WeeklyDayPlan[];
}

export interface DailyPlanner extends BaseWorkoutPlan {
  type: 'Daily';
  targetCategory: string;
  exercises: PlannerExercise[];
}

export type WorkoutPlan = SplitPlanner | WeeklyPlanner | DailyPlanner;

export interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  historySession: any;
  override: any;
  scheduledWorkout: {
    dayName: string;
    category?: string;
    exercises: any[];
    isRestDay: boolean;
  } | null;
  routineName: string;
  isRestDay: boolean;
  exercisesCount: number;
  templateDayName: string;
}
