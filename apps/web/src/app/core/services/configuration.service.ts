import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService extends BaseApiService {

  constructor() {
    super();
  }

  getConfig(): Observable<ApiResponse<any>> {
    return this.get(API_CONSTANTS.SUPER_ADMIN.CONFIG);
  }

  updateConfig(config: any): Observable<ApiResponse<any>> {
    return this.post(API_CONSTANTS.SUPER_ADMIN.CONFIG, config);
  }
}
