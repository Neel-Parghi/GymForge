import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DietPlanService extends BaseApiService {
  private plansCache$: Observable<unknown[]> | null = null;

  getPlans(goal?: string, forceRefresh = false): Observable<unknown[]> {
    if (forceRefresh) {
      this.clearCache();
    }

    if (goal) {
      const params = { goal };
      return this.get<ApiResponse<unknown[]>>(API_CONSTANTS.DIET_PLAN.BASE, params).pipe(
        map(res => res?.data || [])
      );
    }

    if (!this.plansCache$) {
      this.plansCache$ = this.get<ApiResponse<unknown[]>>(API_CONSTANTS.DIET_PLAN.BASE).pipe(
        map(res => res?.data || []),
        shareReplay(1)
      );
    }
    return this.plansCache$;
  }

  getPlanById(id: string): Observable<unknown> {
    const url = API_CONSTANTS.DIET_PLAN.BY_ID.replace('{id}', id);
    return this.get<ApiResponse<unknown>>(url).pipe(
      map(res => res?.data)
    );
  }

  createPlan(plan: unknown): Observable<unknown> {
    return this.post<ApiResponse<unknown>>(API_CONSTANTS.DIET_PLAN.BASE, plan).pipe(
      tap(() => this.clearCache()),
      map(res => res?.data)
    );
  }

  updatePlan(id: string, plan: unknown): Observable<unknown> {
    const url = API_CONSTANTS.DIET_PLAN.BY_ID.replace('{id}', id);
    return this.put<ApiResponse<unknown>>(url, plan).pipe(
      tap(() => this.clearCache()),
      map(res => res?.data)
    );
  }

  deletePlan(id: string): Observable<ApiResponse<unknown>> {
    const url = API_CONSTANTS.DIET_PLAN.BY_ID.replace('{id}', id);
    return this.delete<ApiResponse<unknown>>(url).pipe(
      tap(() => this.clearCache())
    );
  }

  clearCache(): void {
    this.plansCache$ = null;
  }
}
