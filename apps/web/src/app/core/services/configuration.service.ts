import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { API_CONSTANTS } from '../constants/api-constants';
import { shareReplay, tap } from 'rxjs/operators';
import { SaaSConfigurationDto } from '../../shared/models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService extends BaseApiService {
  private cache$?: Observable<ApiResponse<SaaSConfigurationDto>>;

  constructor() {
    super();
  }

  getConfig(forceRefresh = false): Observable<ApiResponse<SaaSConfigurationDto>> {
    if (!this.cache$ || forceRefresh) {
      this.cache$ = this.get<ApiResponse<SaaSConfigurationDto>>(API_CONSTANTS.SUPER_ADMIN.CONFIG).pipe(
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  updateConfig(config: SaaSConfigurationDto): Observable<ApiResponse<SaaSConfigurationDto>> {
    return this.post<ApiResponse<SaaSConfigurationDto>>(API_CONSTANTS.SUPER_ADMIN.CONFIG, config).pipe(
      tap(() => this.cache$ = undefined)
    );
  }
}
