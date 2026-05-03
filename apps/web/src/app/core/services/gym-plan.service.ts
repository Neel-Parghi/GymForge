import { Injectable, inject } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable } from 'rxjs';
import { GymPlan, CreateGymPlanRequest, UpdateGymPlanRequest } from '../../shared/models/gym-plan.model';

@Injectable({
  providedIn: 'root',
})
export class GymPlanService extends BaseApiService {

  constructor() {
    super();
  }

  getPlansByOwnerId(ownerId: string): Observable<GymPlan[]> {
    return this.get(`${API_CONSTANTS.GYM_PLAN.LIST_BY_OWNER}/${ownerId}`);
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
