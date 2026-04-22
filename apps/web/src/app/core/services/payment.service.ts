import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { CreatePaymentRequest, PaymentStats, PaymentTransaction } from '../../shared/models/payment.model';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root',
})
export class PaymentService extends BaseApiService {

  constructor() {
    super();
  }

  getStats(): Observable<ApiResponse<PaymentStats>> {
    return this.get(API_CONSTANTS.PAYMENTS.STATS);
  }

  getTransactions(): Observable<ApiResponse<PaymentTransaction[]>> {
    return this.get(API_CONSTANTS.PAYMENTS.TRANSACTIONS);
  }

  initiatePayment(payload: CreatePaymentRequest): Observable<ApiResponse<{ transactionId: string }>> {
    return this.post(API_CONSTANTS.PAYMENTS.INITIATE, payload);
  }

  verifyPayment(payload: any): Observable<ApiResponse<PaymentTransaction>> {
    return this.post(API_CONSTANTS.PAYMENTS.VERIFY, payload);
  }

}
