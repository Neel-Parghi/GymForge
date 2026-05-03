import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay, tap, Subject, of } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface GymOwnerStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  todayAttendance: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  lowStockItems: number;
  activeTrainers: number;
}

@Injectable({
  providedIn: 'root'
})
export class GymOwnerDashboardService extends BaseApiService {
  private statsCache$?: Observable<any>;
  private refreshStats$ = new Subject<void>();

  getStats(): Observable<any> {
    if (!this.statsCache$) {
      this.statsCache$ = this.get('gym-owner/dashboard/stats', {}).pipe(
        shareReplay(1)
      );
    }
    return this.statsCache$;
  }

  clearCache(): void {
    this.statsCache$ = undefined;
  }
}
