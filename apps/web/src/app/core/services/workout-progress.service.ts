import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ExerciseProgressDto, LoggedExerciseNameDto, MuscleGroupProgressDto } from '../../shared/models/workout-progress.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutProgressService extends BaseApiService {

  private exerciseNamesCache$: Observable<ApiResponse<LoggedExerciseNameDto[]>> | null = null;
  private muscleGroupsCache$: Observable<ApiResponse<MuscleGroupProgressDto[]>> | null = null;
  private exerciseProgressCache = new Map<string, Observable<ApiResponse<ExerciseProgressDto>>>();

  getLoggedExerciseNames(): Observable<ApiResponse<LoggedExerciseNameDto[]>> {
    if (!this.exerciseNamesCache$) {
      this.exerciseNamesCache$ = this.get<ApiResponse<LoggedExerciseNameDto[]>>(API_CONSTANTS.WORKOUT_PROGRESS.EXERCISES).pipe(
        shareReplay(1)
      );
    }
    return this.exerciseNamesCache$;
  }

  getExerciseProgress(exerciseName: string): Observable<ApiResponse<ExerciseProgressDto>> {
    const key = exerciseName.toLowerCase().trim();
    if (!this.exerciseProgressCache.has(key)) {
      this.exerciseProgressCache.set(key, this.get<ApiResponse<ExerciseProgressDto>>(API_CONSTANTS.WORKOUT_PROGRESS.PROGRESS, { exerciseName }).pipe(
        shareReplay(1)
      ));
    }
    return this.exerciseProgressCache.get(key)!;
  }

  getMuscleGroupProgress(): Observable<ApiResponse<MuscleGroupProgressDto[]>> {
    if (!this.muscleGroupsCache$) {
      this.muscleGroupsCache$ = this.get<ApiResponse<MuscleGroupProgressDto[]>>(API_CONSTANTS.WORKOUT_PROGRESS.MUSCLE_GROUPS).pipe(
        shareReplay(1)
      );
    }
    return this.muscleGroupsCache$;
  }

  clearCache(): void {
    this.exerciseNamesCache$ = null;
    this.muscleGroupsCache$ = null;
    this.exerciseProgressCache.clear();
  }
}
