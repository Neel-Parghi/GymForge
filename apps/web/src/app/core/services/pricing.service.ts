import { Injectable, inject } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class PricingService extends BaseApiService {

  constructor() {
    super();
  }

  getAllPlans(): Observable<any> {
    return this.get(API_CONSTANTS.PRICING.GET_LIST);
  }

  addPlan(payload: any): Observable<any> {
    return this.post(API_CONSTANTS.PRICING.ADD, payload);
  }
}


