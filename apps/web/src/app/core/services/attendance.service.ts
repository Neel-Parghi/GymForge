import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BranchContextService } from './branch-context.service';
import { AuthApiService } from './auth-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  AttendanceLogResponse,
  CheckedInMemberResponse,
  OccupancyStatsResponse,
  CheckInRequest,
  CheckOutRequest
} from '../../shared/models/attendance.model';
import { PagedResponse } from '../../shared/models/paged-response.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService extends BaseApiService {
  private branchContextService = inject(BranchContextService);
  private authService = inject(AuthApiService);

  private occupancyCache$?: Observable<ApiResponse<CheckedInMemberResponse[]>> | null;
  private occupancyStatsCache$?: Observable<ApiResponse<OccupancyStatsResponse>> | null;
  private logsCache$?: Observable<ApiResponse<PagedResponse<AttendanceLogResponse>>> | null;

  constructor() {
    super();
    this.authService.userProfile$.subscribe(user => {
      if (!user) {
        this.clearCache();
      }
    });
    this.branchContextService.activeBranch$.subscribe(() => {
      this.clearCache();
    });
  }

  private getUrlWithBranch(url: string): string {
    const branchId = this.branchContextService.getActiveBranchId();
    if (branchId) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}branchId=${branchId}`;
    }
    return url;
  }

  checkIn(request: CheckInRequest): Observable<ApiResponse<AttendanceLogResponse>> {
    return this.post<ApiResponse<AttendanceLogResponse>>(this.getUrlWithBranch(API_CONSTANTS.ATTENDANCE.CHECK_IN), request).pipe(
      tap(() => this.clearCache())
    );
  }

  checkOut(request: CheckOutRequest): Observable<ApiResponse<AttendanceLogResponse>> {
    return this.post<ApiResponse<AttendanceLogResponse>>(this.getUrlWithBranch(API_CONSTANTS.ATTENDANCE.CHECK_OUT), request).pipe(
      tap(() => this.clearCache())
    );
  }

  getOccupancy(forceRefresh = false): Observable<ApiResponse<CheckedInMemberResponse[]>> {
    if (forceRefresh) {
      this.clearCache();
    }
    if (!this.occupancyCache$) {
      this.occupancyCache$ = this.get<ApiResponse<CheckedInMemberResponse[]>>(this.getUrlWithBranch(API_CONSTANTS.ATTENDANCE.OCCUPANCY)).pipe(
        shareReplay(1)
      );
    }
    return this.occupancyCache$;
  }

  getOccupancyStats(forceRefresh = false): Observable<ApiResponse<OccupancyStatsResponse>> {
    if (forceRefresh) {
      this.clearCache();
    }
    if (!this.occupancyStatsCache$) {
      this.occupancyStatsCache$ = this.get<ApiResponse<OccupancyStatsResponse>>(this.getUrlWithBranch(API_CONSTANTS.ATTENDANCE.OCCUPANCY_STATS)).pipe(
        shareReplay(1)
      );
    }
    return this.occupancyStatsCache$;
  }

  getLogs(
    params?: { searchTerm?: string; status?: string; pageNumber?: number; pageSize?: number; date?: string },
    forceRefresh = false
  ): Observable<ApiResponse<PagedResponse<AttendanceLogResponse>>> {
    const isDefault = !params?.searchTerm &&
                      (!params?.status || params.status === 'all') &&
                      params?.pageNumber === 1 &&
                      params?.pageSize === 100 &&
                      params?.date === this.getTodayDateString();

    if (forceRefresh) {
      this.clearCache();
    }

    if (isDefault) {
      if (!this.logsCache$) {
        this.logsCache$ = this.get<ApiResponse<PagedResponse<AttendanceLogResponse>>>(this.getUrlWithBranch(API_CONSTANTS.ATTENDANCE.LOGS), params).pipe(
          shareReplay(1)
        );
      }
      return this.logsCache$;
    }

    return this.get<ApiResponse<PagedResponse<AttendanceLogResponse>>>(this.getUrlWithBranch(API_CONSTANTS.ATTENDANCE.LOGS), params);
  }

  private getTodayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  clearCache(): void {
    this.occupancyCache$ = null;
    this.occupancyStatsCache$ = null;
    this.logsCache$ = null;
  }
}
