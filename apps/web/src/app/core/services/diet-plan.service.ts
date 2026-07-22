import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../shared/models/api-response.model';
import { DietPlanDto, CreateDietPlanRequest, UpdateDietPlanRequest } from '../../shared/models/diet-plan.model';

@Injectable({
  providedIn: 'root'
})
export class DietPlanService extends BaseApiService {
  private plansCache$: Observable<DietPlanDto[]> | null = null;

  getPlans(goal?: string, forceRefresh = false): Observable<DietPlanDto[]> {
    if (forceRefresh) {
      this.clearCache();
    }

    if (goal) {
      const params = { goal };
      return this.get<ApiResponse<DietPlanDto[]>>(API_CONSTANTS.DIET_PLAN.BASE, params).pipe(
        map(res => res?.data || [])
      );
    }

    if (!this.plansCache$) {
      this.plansCache$ = this.get<ApiResponse<DietPlanDto[]>>(API_CONSTANTS.DIET_PLAN.BASE).pipe(
        map(res => res?.data || []),
        shareReplay(1)
      );
    }
    return this.plansCache$;
  }

  getPlanById(id: string): Observable<DietPlanDto> {
    const url = API_CONSTANTS.DIET_PLAN.BY_ID.replace('{id}', id);
    return this.get<ApiResponse<DietPlanDto>>(url).pipe(
      map(res => res?.data as DietPlanDto)
    );
  }

  createPlan(plan: CreateDietPlanRequest): Observable<DietPlanDto> {
    return this.post<ApiResponse<DietPlanDto>>(API_CONSTANTS.DIET_PLAN.BASE, plan).pipe(
      tap(() => this.clearCache()),
      map(res => res?.data as DietPlanDto)
    );
  }

  updatePlan(id: string, plan: UpdateDietPlanRequest): Observable<DietPlanDto> {
    const url = API_CONSTANTS.DIET_PLAN.BY_ID.replace('{id}', id);
    return this.put<ApiResponse<DietPlanDto>>(url, plan).pipe(
      tap(() => this.clearCache()),
      map(res => res?.data as DietPlanDto)
    );
  }

  deletePlan(id: string): Observable<ApiResponse<null>> {
    const url = API_CONSTANTS.DIET_PLAN.BY_ID.replace('{id}', id);
    return this.delete<ApiResponse<null>>(url).pipe(
      tap(() => this.clearCache())
    );
  }

  clearCache(): void {
    this.plansCache$ = null;
  }
}
