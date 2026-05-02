import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, shareReplay } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseApiService {

  private statsCache$?: Observable<ApiResponse<any>>;

  constructor() {
    super();
  }

  clearStatsCache(): void {
    this.statsCache$ = undefined;
  }

  getStats(forceRefresh = false): Observable<ApiResponse<any>> {
    if (!this.statsCache$ || forceRefresh) {
      this.statsCache$ = this.get<ApiResponse<any>>(API_CONSTANTS.SUPER_ADMIN.DASHBOARD).pipe(
        shareReplay(1)
      );
    }
    return this.statsCache$;
  }

  downloadReport(type: string): Observable<Blob> {
    return this.getBlob(API_CONSTANTS.SUPER_ADMIN.REPORTS.EXPORT, { type });
  }
}
