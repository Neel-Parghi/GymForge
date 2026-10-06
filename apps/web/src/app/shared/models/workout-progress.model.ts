export interface LoggedExerciseNameDto {
  name: string;
  muscleGroup: string | null;
  lastLoggedDate: string;
}

export interface ProgressSetDto {
  setNo: number;
  weight: number;
  reps: number;
}

export interface ExerciseProgressPointDto {
  sessionLogId: string;
  date: string;
  dayName: string;
  topWeight: number;
  topWeightReps: number;
  totalSets: number;
  totalReps: number;
  volume: number;
  sets: ProgressSetDto[];
}

export interface ExerciseProgressDto {
  exerciseName: string;
  muscleGroup: string | null;
  personalBest: number;
  totalSessions: number;
  lastLoggedDate: string | null;
  estimatedOneRepMax: number | null;
  points: ExerciseProgressPointDto[];
}

export interface MuscleGroupExerciseDto {
  name: string;
  totalSessions: number;
  last: ExerciseProgressPointDto;
  previous: ExerciseProgressPointDto | null;
  isNewPersonalBest: boolean;
  trend: number[];
}

export interface MuscleGroupProgressDto {
  muscleGroup: string;
  weeklySessions: number;
  weeklySets: number;
  weeklyVolume: number;
  previousWeeklyVolume: number;
  exercises: MuscleGroupExerciseDto[];
}
