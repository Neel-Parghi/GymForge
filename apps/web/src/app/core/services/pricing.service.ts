import { Injectable, inject } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable } from 'rxjs/internal/Observable';
import { PricingPlan, PricingPlanCreateRequest } from '../../shared/models/pricing.model';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class PricingService extends BaseApiService {

  constructor() {
    super();
  }

  getAllPlans(): Observable<ApiResponse<PricingPlan[]>> {
    return this.get(API_CONSTANTS.PRICING.LIST);
  }

  addPlan(payload: PricingPlanCreateRequest): Observable<ApiResponse<PricingPlan>> {
    return this.post(API_CONSTANTS.PRICING.ADD, payload);
  }

  updatePlan(payload: PricingPlan): Observable<ApiResponse<PricingPlan>> {
    return this.put(`${API_CONSTANTS.PRICING.UPDATE}/${payload.id}`, payload);
  }

  deletePlan(id: string): Observable<any> {
    return this.delete(`${API_CONSTANTS.PRICING.DELETE}/${id}`);
  }
}


