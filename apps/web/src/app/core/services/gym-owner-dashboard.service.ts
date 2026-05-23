import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay, tap, Subject, of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BranchContextService } from './branch-context.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { GymOwnerStats } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class GymOwnerDashboardService extends BaseApiService {
  private branchContextService = inject(BranchContextService);
  private statsCache$?: Observable<any>;
  private refreshStats$ = new Subject<void>();

  constructor() {
    super();
    this.branchContextService.activeBranch$.subscribe(() => {
      this.clearCache();
    });
  }

  getStats(): Observable<any> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (branchId) {
      return this.get(API_CONSTANTS.GYM_OWNER.DASHBOARD, { branchId });
    }

    if (!this.statsCache$) {
      this.statsCache$ = this.get(API_CONSTANTS.GYM_OWNER.DASHBOARD, {}).pipe(
        shareReplay(1)
      );
    }
    return this.statsCache$;
  }

  clearCache(): void {
    this.statsCache$ = undefined;
  }
}
