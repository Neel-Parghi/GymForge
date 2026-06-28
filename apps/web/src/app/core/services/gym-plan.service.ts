import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay } from 'rxjs';
import { GymPlan, CreateGymPlanRequest, UpdateGymPlanRequest } from '../../shared/models/gym-plan.model';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class GymPlanService extends BaseApiService {

  constructor() {
    super();
  }

  private plansCache$: Observable<ApiResponse<GymPlan[]>> | null = null;
  
  getGymPlans(): Observable<ApiResponse<GymPlan[]>> {
    if (this.plansCache$) {
      return this.plansCache$;
    }

    this.plansCache$ = this.get<ApiResponse<GymPlan[]>>(API_CONSTANTS.GYM_PLAN.LIST)
      .pipe(shareReplay(1));

    return this.plansCache$;
  }

  clearCache(): void {
    this.plansCache$ = null;
  }

  getPlanById(planId: string): Observable<ApiResponse<GymPlan>> {
    return this.get<ApiResponse<GymPlan>>(`${API_CONSTANTS.GYM_PLAN.GET}/${planId}`);
  }

  addPlan(payload: CreateGymPlanRequest): Observable<ApiResponse<GymPlan>> {
    return this.post<ApiResponse<GymPlan>>(API_CONSTANTS.GYM_PLAN.ADD, payload);
  }

  updatePlan(payload: UpdateGymPlanRequest): Observable<ApiResponse<GymPlan>> {
    return this.put<ApiResponse<GymPlan>>(`${API_CONSTANTS.GYM_PLAN.UPDATE}/${payload.id}`, payload);
  }

  deletePlan(planId: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.delete<ApiResponse<{ success: boolean }>>(`${API_CONSTANTS.GYM_PLAN.DELETE}/${planId}`);
  }

  promotePlan(planId: string): Observable<ApiResponse<{ success: boolean, message: string }>> {
    return this.post<ApiResponse<{ success: boolean, message: string }>>(`${API_CONSTANTS.GYM_PLAN.GET}/${planId}/promote`, {});
  }
}
