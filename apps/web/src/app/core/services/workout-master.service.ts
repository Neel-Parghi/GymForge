import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, of, shareReplay } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Exercise } from '../../shared/models/exercise.model';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutMasterService extends BaseApiService {
  private categoriesCache$: Observable<string[]> | null = null;
  private exercisesCache$: Observable<Exercise[]> | null = null;
  private categoryExercisesCache = new Map<string, Observable<Exercise[]>>();

  constructor() {
    super();
  }

  // Get list of all target muscle group categories
  getCategories(): Observable<string[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.get<ApiResponse<string[]>>(API_CONSTANTS.WORKOUT_MASTER.CATEGORIES).pipe(
        map(res => (res?.data || res) as string[]),
        shareReplay(1)
      );
    }
    return this.categoriesCache$;
  }

  getExercises(filters?: { category?: string; equipment?: string; search?: string }): Observable<Exercise[]> {
    if (filters && (filters.category || filters.equipment || filters.search)) {
      let url = API_CONSTANTS.WORKOUT_MASTER.EXERCISES;
      const queryParams: string[] = [];

      if (filters.category) queryParams.push(`category=${encodeURIComponent(filters.category)}`);
      if (filters.equipment) queryParams.push(`equipment=${encodeURIComponent(filters.equipment)}`);
      if (filters.search) queryParams.push(`search=${encodeURIComponent(filters.search)}`);

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      return this.get<ApiResponse<Exercise[]>>(url).pipe(
        map(res => (res?.data || res) as Exercise[])
      );
    }

    if (!this.exercisesCache$) {
      this.exercisesCache$ = this.get<ApiResponse<Exercise[]>>(API_CONSTANTS.WORKOUT_MASTER.EXERCISES).pipe(
        map(res => (res?.data || res) as Exercise[]),
        shareReplay(1)
      );
    }
    return this.exercisesCache$;
  }

  // Get exercise lists for a specific category
  getExercisesByCategory(category: string): Observable<Exercise[]> {
    if (!category) return of([]);
    if (!this.categoryExercisesCache.has(category)) {
      const url = API_CONSTANTS.WORKOUT_MASTER.BY_CATEGORY.replace('{category}', encodeURIComponent(category));
      const obs = this.get<ApiResponse<Exercise[]>>(url).pipe(
        map(res => (res?.data || res) as Exercise[]),
        shareReplay(1)
      );
      this.categoryExercisesCache.set(category, obs);
    }
    return this.categoryExercisesCache.get(category)!;
  }

  clearCache(): void {
    this.categoriesCache$ = null;
    this.exercisesCache$ = null;
    this.categoryExercisesCache.clear();
  }
}
