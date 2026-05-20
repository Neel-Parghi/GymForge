import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay, tap, Subject, of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BranchContextService } from './branch-context.service';
import { API_CONSTANTS } from '../constants/api-constants';

export interface RecentEnrollment {
  memberName: string;
  email: string;
  planName: string;
  enrollmentDate: string;
  status: string;
  initials: string;
}

export interface UpcomingRenewal {
  memberName: string;
  daysRemaining: number;
  endDate: string;
}

export interface GymOwnerStats {
  totalMembers: number;
  memberGrowthPercentage: number;
  activeMembers: number;
  frozenMembers: number;
  newMembersThisMonth: number;
  todayAttendance: number;
  monthlyRevenue: number;
  membershipRevenue: number;
  productSalesRevenue: number;
  pendingInvoices: number;
  lowStockItems: number;
  activeTrainers: number;
  supportStaffCount: number;
  maintenanceDueCount: number;
  recentEnrollments: RecentEnrollment[];
  upcomingRenewals: UpcomingRenewal[];
}

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
