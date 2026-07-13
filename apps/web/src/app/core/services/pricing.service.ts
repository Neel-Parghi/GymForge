import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay, tap } from 'rxjs';
import { PricingPlan, PricingPlanCreateRequest } from '../../shared/models/pricing.model';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class PricingService extends BaseApiService {

  private plansCache$?: Observable<ApiResponse<PricingPlan[]>>;

  constructor() {
    super();
  }

  clearCache(): void {
    this.plansCache$ = undefined;
  }

  getAllPlans(forceRefresh = false): Observable<ApiResponse<PricingPlan[]>> {
    if (!this.plansCache$ || forceRefresh) {
      this.plansCache$ = this.get<ApiResponse<PricingPlan[]>>(API_CONSTANTS.PRICING.LIST).pipe(
        shareReplay(1)
      );
    }
    return this.plansCache$;
  }

  addPlan(payload: PricingPlanCreateRequest): Observable<ApiResponse<PricingPlan>> {
    return this.post<ApiResponse<PricingPlan>>(API_CONSTANTS.PRICING.ADD, payload).pipe(
      tap(() => this.clearCache())
    );
  }

  updatePlan(payload: PricingPlan): Observable<ApiResponse<PricingPlan>> {
    return this.put<ApiResponse<PricingPlan>>(`${API_CONSTANTS.PRICING.UPDATE}/${payload.id}`, payload).pipe(
      tap(() => this.clearCache())
    );
  }

  deletePlan(id: string): Observable<ApiResponse<unknown>> {
    return this.delete<ApiResponse<unknown>>(`${API_CONSTANTS.PRICING.DELETE}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }
}
