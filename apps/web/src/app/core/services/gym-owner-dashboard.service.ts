import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BranchContextService } from './branch-context.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { ApiResponse } from '../../shared/models/api-response.model';
import { GymOwnerDashboardDto } from '../../shared/models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class GymOwnerDashboardService extends BaseApiService {
  private branchContextService = inject(BranchContextService);
  private statsCache$?: Observable<ApiResponse<GymOwnerDashboardDto>>;

  constructor() {
    super();
    this.branchContextService.activeBranch$.subscribe(() => {
      this.clearCache();
    });
  }

  getStats(forceRefresh = false): Observable<ApiResponse<GymOwnerDashboardDto>> {
    if (forceRefresh) {
      this.clearCache();
    }

    if (!this.statsCache$) {
      const branchId = this.branchContextService.getActiveBranchId();
      const params = branchId ? { branchId } : {};

      this.statsCache$ = this.get<ApiResponse<GymOwnerDashboardDto>>(API_CONSTANTS.GYM_OWNER.DASHBOARD, params).pipe(
        shareReplay(1)
      );
    }
    return this.statsCache$;
  }

  clearCache(): void {
    this.statsCache$ = undefined;
  }
}
