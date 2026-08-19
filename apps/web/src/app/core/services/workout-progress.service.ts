import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ExerciseProgressDto, LoggedExerciseNameDto } from '../../shared/models/workout-progress.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutProgressService extends BaseApiService {

  getLoggedExerciseNames(): Observable<ApiResponse<LoggedExerciseNameDto[]>> {
    return this.get<ApiResponse<LoggedExerciseNameDto[]>>(API_CONSTANTS.WORKOUT_PROGRESS.EXERCISES);
  }

  getExerciseProgress(exerciseName: string): Observable<ApiResponse<ExerciseProgressDto>> {
    return this.get<ApiResponse<ExerciseProgressDto>>(API_CONSTANTS.WORKOUT_PROGRESS.PROGRESS, { exerciseName });
  }
}
