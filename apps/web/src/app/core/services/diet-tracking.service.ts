import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { DietLogDto, AddMealEntryRequestDto, DietLogSummaryDto } from '../../shared/models/diet-tracking.model';

@Injectable({
  providedIn: 'root'
})
export class DietTrackingService extends BaseApiService {

  private dietLogCache = new Map<string, Observable<ApiResponse<DietLogDto>>>();

  getUserDietLog(date: string): Observable<ApiResponse<DietLogDto>> {
    if (!this.dietLogCache.has(date)) {
      const req$ = this.get<ApiResponse<DietLogDto>>(`${API_CONSTANTS.DIET_TRACKING.USER_GET_LOG(date)}`).pipe(
        shareReplay(1)
      );
      this.dietLogCache.set(date, req$);
    }
    return this.dietLogCache.get(date)!;
  }

  invalidateDietLogCache(date: string) {
    this.dietLogCache.delete(date);
  }

  addMealEntry(entry: AddMealEntryRequestDto): Observable<ApiResponse<null>> {
    return this.post<ApiResponse<null>>(`${API_CONSTANTS.DIET_TRACKING.USER_ADD_MEAL}`, entry);
  }

  removeMealEntry(mealEntryId: string): Observable<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`${API_CONSTANTS.DIET_TRACKING.USER_REMOVE_MEAL(mealEntryId)}`);
  }

  getUserWeeklySummary(endDate: string): Observable<ApiResponse<DietLogSummaryDto[]>> {
    return this.get<ApiResponse<DietLogSummaryDto[]>>(`${API_CONSTANTS.DIET_TRACKING.USER_SUMMARY(endDate)}`);
  }

  searchFood(query: string): Observable<ApiResponse<unknown>> {
    return this.get<ApiResponse<unknown>>(`${API_CONSTANTS.DIET_TRACKING.USER_SEARCH_FOOD(query)}`);
  }

  getMemberDietLog(memberId: string, date: string): Observable<ApiResponse<DietLogDto>> {
    return this.get<ApiResponse<DietLogDto>>(`${API_CONSTANTS.DIET_TRACKING.TRAINER_GET_LOG(memberId, date)}`);
  }

  getMemberWeeklySummary(memberId: string, endDate: string): Observable<ApiResponse<DietLogSummaryDto[]>> {
    return this.get<ApiResponse<DietLogSummaryDto[]>>(`${API_CONSTANTS.DIET_TRACKING.TRAINER_SUMMARY(memberId, endDate)}`);
  }
}
