export interface LoggedExerciseNameDto {
  name: string;
  muscleGroup: string | null;
  lastLoggedDate: string;
}

export interface ExerciseProgressPointDto {
  sessionLogId: string;
  date: string;
  topWeight: number;
  topWeightReps: number;
  totalSets: number;
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
