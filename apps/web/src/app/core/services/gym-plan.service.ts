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
  private lastOwnerId: string | null = null;

  getPlansByOwnerId(ownerId: string): Observable<ApiResponse<GymPlan[]>> {
    if (this.plansCache$ && this.lastOwnerId === ownerId) {
      return this.plansCache$;
    }

    this.lastOwnerId = ownerId;
    this.plansCache$ = this.get<ApiResponse<GymPlan[]>>(`${API_CONSTANTS.GYM_PLAN.LIST_BY_OWNER}/${ownerId}`)
      .pipe(shareReplay(1));

    return this.plansCache$;
  }

  clearCache(): void {
    this.plansCache$ = null;
    this.lastOwnerId = null;
  }

  getPlanById(planId: string): Observable<GymPlan> {
    return this.get(`${API_CONSTANTS.GYM_PLAN.GET}/${planId}`);
  }

  addPlan(payload: CreateGymPlanRequest): Observable<GymPlan> {
    return this.post(API_CONSTANTS.GYM_PLAN.ADD, payload);
  }

  updatePlan(payload: UpdateGymPlanRequest): Observable<GymPlan> {
    return this.put(API_CONSTANTS.GYM_PLAN.UPDATE, payload);
  }

  deletePlan(planId: string): Observable<boolean> {
    return this.delete(`${API_CONSTANTS.GYM_PLAN.DELETE}/${planId}`);
  }
}
