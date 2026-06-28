import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class DietTrackingService extends BaseApiService {

  private dietLogCache = new Map<string, Observable<any>>();

  getUserDietLog(date: string): Observable<any> {
    if (!this.dietLogCache.has(date)) {
      const req$ = this.get<any>(`${API_CONSTANTS.DIET_TRACKING.USER_GET_LOG(date)}`).pipe(
        shareReplay(1)
      );
      this.dietLogCache.set(date, req$);
    }
    return this.dietLogCache.get(date)!;
  }

  /** Call this after adding/removing a meal to bust the cache for that date */
  invalidateDietLogCache(date: string) {
    this.dietLogCache.delete(date);
  }

  addMealEntry(entry: any): Observable<any> {
    return this.post<any>(`${API_CONSTANTS.DIET_TRACKING.USER_ADD_MEAL}`, entry);
  }

  removeMealEntry(mealEntryId: string): Observable<any> {
    return this.delete<any>(`${API_CONSTANTS.DIET_TRACKING.USER_REMOVE_MEAL(mealEntryId)}`);
  }

  getUserWeeklySummary(endDate: string): Observable<any> {
    return this.get<any>(`${API_CONSTANTS.DIET_TRACKING.USER_SUMMARY(endDate)}`);
  }

  searchFood(query: string): Observable<any> {
    return this.get<any>(`${API_CONSTANTS.DIET_TRACKING.USER_SEARCH_FOOD(query)}`);
  }

  // Trainer Endpoints
  getMemberDietLog(memberId: string, date: string): Observable<any> {
    return this.get<any>(`${API_CONSTANTS.DIET_TRACKING.TRAINER_GET_LOG(memberId, date)}`);
  }

  getMemberWeeklySummary(memberId: string, endDate: string): Observable<any> {
    return this.get<any>(`${API_CONSTANTS.DIET_TRACKING.TRAINER_SUMMARY(memberId, endDate)}`);
  }
}
