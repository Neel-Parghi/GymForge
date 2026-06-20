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
  private plansCache$: Observable<any[]> | null = null;

  getPlans(goal?: string, forceRefresh = false): Observable<any[]> {
    if (forceRefresh) {
      this.clearCache();
    }

    if (goal) {
      const params = { goal };
      return this.get<ApiResponse<any[]>>(API_CONSTANTS.DIET_PLAN.BASE, params).pipe(
        map(res => res?.data || [])
      );
    }

    if (!this.plansCache$) {
      this.plansCache$ = this.get<ApiResponse<any[]>>(API_CONSTANTS.DIET_PLAN.BASE).pipe(
        map(res => res?.data || []),
        shareReplay(1)
      );
    }
    return this.plansCache$;
  }

  getPlanById(id: string): Observable<any> {
    const url = API_CONSTANTS.DIET_PLAN.BY_ID.replace('{id}', id);
    return this.get<ApiResponse<any>>(url).pipe(
      map(res => res?.data)
    );
  }

  createPlan(plan: any): Observable<any> {
    return this.post<ApiResponse<any>>(API_CONSTANTS.DIET_PLAN.BASE, plan).pipe(
      tap(() => this.clearCache()),
      map(res => res?.data)
    );
  }

  updatePlan(id: string, plan: any): Observable<any> {
    const url = API_CONSTANTS.DIET_PLAN.BY_ID.replace('{id}', id);
    return this.put<ApiResponse<any>>(url, plan).pipe(
      tap(() => this.clearCache()),
      map(res => res?.data)
    );
  }

  deletePlan(id: string): Observable<ApiResponse<any>> {
    const url = API_CONSTANTS.DIET_PLAN.BY_ID.replace('{id}', id);
    return this.delete<ApiResponse<any>>(url).pipe(
      tap(() => this.clearCache())
    );
  }

  clearCache(): void {
    this.plansCache$ = null;
  }
}
