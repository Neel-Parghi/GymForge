import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseApiService {

  constructor() {
    super();
  }

  getStats(): Observable<ApiResponse<any>> {
    return this.get(API_CONSTANTS.SUPER_ADMIN.DASHBOARD);
  }

  downloadReport(type: string): Observable<Blob> {
    return this.getBlob(API_CONSTANTS.SUPER_ADMIN.REPORTS.EXPORT, { type });
  }
}
