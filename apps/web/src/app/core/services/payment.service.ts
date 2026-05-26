import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, shareReplay, tap } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { CreatePaymentRequest, GymSubscriptionStatus, PaymentStats, PaymentTransaction, SaaSConfiguration } from '../../shared/models/payment.model';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root',
})
export class PaymentService extends BaseApiService {

  private statsCache$?: Observable<ApiResponse<PaymentStats>>;
  private transactionsCache$?: Observable<ApiResponse<PaymentTransaction[]>>;
  private subscriptionStatusCache$?: Observable<ApiResponse<GymSubscriptionStatus>>;
  private subscriptionHistoryCache$?: Observable<ApiResponse<PaymentTransaction[]>>;

  constructor() {
    super();
  }

  clearStatsCache(): void {
    this.statsCache$ = undefined;
  }

  clearTransactionsCache(): void {
    this.transactionsCache$ = undefined;
  }

  clearSubscriptionCache(): void {
    this.subscriptionStatusCache$ = undefined;
    this.subscriptionHistoryCache$ = undefined;
  }

  getStats(forceRefresh = false): Observable<ApiResponse<PaymentStats>> {
    if (!this.statsCache$ || forceRefresh) {
      this.statsCache$ = this.get<ApiResponse<PaymentStats>>(API_CONSTANTS.PAYMENTS.STATS).pipe(
        shareReplay(1)
      );
    }
    return this.statsCache$;
  }

  getTransactions(forceRefresh = false): Observable<ApiResponse<PaymentTransaction[]>> {
    if (!this.transactionsCache$ || forceRefresh) {
      this.transactionsCache$ = this.get<ApiResponse<PaymentTransaction[]>>(API_CONSTANTS.PAYMENTS.TRANSACTIONS).pipe(
        shareReplay(1)
      );
    }
    return this.transactionsCache$;
  }

  initiatePayment(payload: CreatePaymentRequest): Observable<ApiResponse<{ transactionId: string }>> {
    return this.post<ApiResponse<{ transactionId: string }>>(API_CONSTANTS.PAYMENTS.INITIATE, payload).pipe(
      tap(() => {
        this.clearStatsCache();
        this.clearTransactionsCache();
        this.clearSubscriptionCache();
      })
    );
  }

  verifyPayment(payload: any): Observable<ApiResponse<PaymentTransaction>> {
    return this.post<ApiResponse<PaymentTransaction>>(API_CONSTANTS.PAYMENTS.VERIFY, payload).pipe(
      tap(() => {
        this.clearStatsCache();
        this.clearTransactionsCache();
        this.clearSubscriptionCache();
      })
    );
  }

  getSettings(): Observable<ApiResponse<SaaSConfiguration>> {
    return this.get(API_CONSTANTS.PAYMENTS.SETTINGS);
  }

  updateSettings(settings: SaaSConfiguration): Observable<ApiResponse<void>> {
    return this.put(API_CONSTANTS.PAYMENTS.UPDATE_SAAS_CONFIG, settings);
  }

  getSubscriptionStatus(forceRefresh = false): Observable<ApiResponse<GymSubscriptionStatus>> {
    if (!this.subscriptionStatusCache$ || forceRefresh) {
      this.subscriptionStatusCache$ = this.get<ApiResponse<GymSubscriptionStatus>>(API_CONSTANTS.PAYMENTS.SUBSCRIPTION).pipe(
        shareReplay(1)
      );
    }
    return this.subscriptionStatusCache$;
  }

  renewSubscription(planName: string = 'GymForge Pro Plan', price: number = 4999): Observable<ApiResponse<GymSubscriptionStatus>> {
    return this.post<ApiResponse<GymSubscriptionStatus>>(`${API_CONSTANTS.PAYMENTS.SUBSCRIPTION}/renew?planName=${encodeURIComponent(planName)}&price=${price}`, {}).pipe(
      tap(() => {
        this.clearSubscriptionCache();
      })
    );
  }

  getSubscriptionHistory(forceRefresh = false): Observable<ApiResponse<PaymentTransaction[]>> {
    if (!this.subscriptionHistoryCache$ || forceRefresh) {
      this.subscriptionHistoryCache$ = this.get<ApiResponse<PaymentTransaction[]>>(API_CONSTANTS.PAYMENTS.HISTORY).pipe(
        shareReplay(1)
      );
    }
    return this.subscriptionHistoryCache$;
  }

}
