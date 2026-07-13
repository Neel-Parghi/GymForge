import { Injectable, inject } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay, tap } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { StaffResponse, AddStaffRequest, MeasurementResponse, AddMeasurementRequest, StaffAttendanceLogResponse } from '../models/staff.model';
import { PagedResponse } from '../../shared/models/paged-response.model';
import { BranchContextService } from './branch-context.service';

@Injectable({
  providedIn: 'root'
})
export class StaffService extends BaseApiService {

  private branchContextService = inject(BranchContextService);
  private staffCache$: Observable<ApiResponse<PagedResponse<StaffResponse>>> | null = null;
  private staffCacheLarge$: Observable<ApiResponse<PagedResponse<StaffResponse>>> | null = null;
  private unscopedStaffCache$: Observable<ApiResponse<PagedResponse<StaffResponse>>> | null = null;
  private membersCache: Map<string, Observable<ApiResponse<unknown[]>>> = new Map();
  private staffLogsCache$: Observable<ApiResponse<unknown>> | null = null;
  private staffBypassedLogsCache$: Observable<ApiResponse<unknown>> | null = null;
  private measurementsCache = new Map<string, Observable<ApiResponse<MeasurementResponse[]>>>();
  private staffDetailsCache = new Map<string, Observable<ApiResponse<StaffResponse>>>();
  private attendanceLogsCache = new Map<string, Observable<ApiResponse<unknown>>>();

  constructor() {
    super();
    this.branchContextService.activeBranch$.subscribe(() => {
      this.clearCache();
    });
  }

  getGymStaff(page: number = 1, pageSize: number = 10, searchTerm: string = '', forceRefresh = false): Observable<ApiResponse<PagedResponse<StaffResponse>>> {
    const branchId = this.branchContextService.getActiveBranchId();

    if (forceRefresh) {
      this.clearCache();
    }

    if (searchTerm || page !== 1 || (pageSize !== 10 && pageSize !== 100)) {
      const params: Record<string, string | number> = { pageNumber: page, pageSize };
      if (searchTerm)
        params['searchTerm'] = searchTerm;
      if (branchId)
        params['branchId'] = branchId;
      return this.get<ApiResponse<PagedResponse<StaffResponse>>>(API_CONSTANTS.STAFF.LIST, params);
    }

    if (pageSize === 10) {
      if (!this.staffCache$) {
        const params: Record<string, string | number> = { pageNumber: 1, pageSize: 10 };
        if (branchId)
          params['branchId'] = branchId;
        this.staffCache$ = this.get<ApiResponse<PagedResponse<StaffResponse>>>(API_CONSTANTS.STAFF.LIST, params).pipe(
          shareReplay(1)
        );
      }
      return this.staffCache$;
    } else {
      if (!this.staffCacheLarge$) {
        const params: Record<string, string | number> = { pageNumber: 1, pageSize: 100 };
        if (branchId)
          params['branchId'] = branchId;
        this.staffCacheLarge$ = this.get<ApiResponse<PagedResponse<StaffResponse>>>(API_CONSTANTS.STAFF.LIST, params).pipe(
          shareReplay(1)
        );
      }
      return this.staffCacheLarge$;
    }
  }

  getUnscopedGymStaff(page: number = 1, pageSize: number = 100, forceRefresh = false): Observable<ApiResponse<PagedResponse<StaffResponse>>> {
    if (forceRefresh) {
      this.clearCache();
    }

    if (page !== 1 || pageSize !== 100) {
      return this.get<ApiResponse<PagedResponse<StaffResponse>>>(API_CONSTANTS.STAFF.LIST, { pageNumber: page, pageSize });
    }

    if (!this.unscopedStaffCache$) {
      this.unscopedStaffCache$ = this.get<ApiResponse<PagedResponse<StaffResponse>>>(API_CONSTANTS.STAFF.LIST, { pageNumber: 1, pageSize: 100 }).pipe(
        shareReplay(1)
      );
    }
    return this.unscopedStaffCache$;
  }

  getStaffById(id: string, forceRefresh = false): Observable<ApiResponse<StaffResponse>> {
    if (forceRefresh || !this.staffDetailsCache.has(id)) {
      const request$ = this.get<ApiResponse<StaffResponse>>(`${API_CONSTANTS.STAFF.BASE}/${id}`).pipe(
        shareReplay(1)
      );
      this.staffDetailsCache.set(id, request$);
    }
    return this.staffDetailsCache.get(id)!;
  }

  addStaff(payload: AddStaffRequest): Observable<ApiResponse<StaffResponse>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (branchId && !payload.branchId) {
      payload.branchId = branchId;
    }
    return this.post<ApiResponse<StaffResponse>>(API_CONSTANTS.STAFF.LIST, payload).pipe(
      tap(() => this.clearCache())
    );
  }

  updateStaff(id: string, payload: AddStaffRequest): Observable<ApiResponse<unknown>> {
    return this.put<ApiResponse<unknown>>(`${API_CONSTANTS.STAFF.BASE}/${id}`, payload).pipe(
      tap(() => {
        this.staffDetailsCache.delete(id);
        this.clearCache();
      })
    );
  }

  deleteStaff(id: string): Observable<ApiResponse<unknown>> {
    return this.delete<ApiResponse<unknown>>(`${API_CONSTANTS.STAFF.BASE}/${id}`).pipe(
      tap(() => {
        this.staffDetailsCache.delete(id);
        this.clearCache();
      })
    );
  }

  getAssignedMembers(trainerId: string, forceRefresh = false): Observable<ApiResponse<unknown[]>> {
    if (!this.membersCache.has(trainerId) || forceRefresh) {
      const request$ = this.get<ApiResponse<unknown[]>>(`${API_CONSTANTS.STAFF.BASE}/${trainerId}/members`).pipe(
        shareReplay(1)
      );
      this.membersCache.set(trainerId, request$);
    }
    return this.membersCache.get(trainerId)!;
  }

  assignTrainerToMember(trainerId: string, memberId: string, slot?: string, durationDays?: number): Observable<ApiResponse<unknown>> {
    let url = `${API_CONSTANTS.STAFF.BASE}/${trainerId}/assign-member/${memberId}?`;

    const params: string[] = [];

    if (slot)
      params.push(`slot=${encodeURIComponent(slot)}`);

    if (durationDays)
      params.push(`durationDays=${durationDays}`);

    url += params.join('&');

    return this.post<ApiResponse<unknown>>(url, {}).pipe(
      tap(() => this.membersCache.delete(trainerId))
    );
  }

  deallocateTrainerFromMember(trainerId: string, memberId: string): Observable<ApiResponse<unknown>> {
    const url = `${API_CONSTANTS.STAFF.BASE}/${trainerId}/deallocate-member/${memberId}`;
    return this.post<ApiResponse<unknown>>(url, {}).pipe(
      tap(() => this.membersCache.delete(trainerId))
    );
  }

  recordMeasurement(memberId: string, payload: AddMeasurementRequest): Observable<ApiResponse<unknown>> {
    const url = API_CONSTANTS.MEMBERS.MEASUREMENTS.replace('{memberId}', memberId);
    return this.post<ApiResponse<unknown>>(url, payload).pipe(
      tap(() => this.measurementsCache.delete(memberId))
    );
  }

  getMemberMeasurements(memberId: string, forceRefresh = false): Observable<ApiResponse<MeasurementResponse[]>> {
    if (forceRefresh || !this.measurementsCache.has(memberId)) {
      const url = API_CONSTANTS.MEMBERS.MEASUREMENTS.replace('{memberId}', memberId);
      const obs = this.get<ApiResponse<MeasurementResponse[]>>(url).pipe(shareReplay(1));
      this.measurementsCache.set(memberId, obs);
    }
    return this.measurementsCache.get(memberId)!;
  }

  checkInStaff(staffId: string, notes?: string): Observable<ApiResponse<StaffResponse>> {
    return this.post<ApiResponse<StaffResponse>>(`${API_CONSTANTS.STAFF.BASE}/${staffId}/check-in`, { notes }).pipe(
      tap(() => {
        this.staffDetailsCache.delete(staffId);
        this.clearCache();
      })
    );
  }

  checkOutStaff(staffId: string): Observable<ApiResponse<StaffResponse>> {
    return this.post<ApiResponse<StaffResponse>>(`${API_CONSTANTS.STAFF.BASE}/${staffId}/check-out`, {}).pipe(
      tap(() => {
        this.staffDetailsCache.delete(staffId);
        this.clearCache();
      })
    );
  }

  getRoleName(role: number): string {
    switch (role) {
      case 1: return 'Trainer';
      case 2: return 'Receptionist';
      case 3: return 'Manager';
      case 4: return 'Cleaner';
      case 5: return 'Yoga Instructor';
      case 6: return 'Zumba Instructor';
      default: return 'Other';
    }
  }

  getStaffAttendanceLogs(params?: Record<string, string | number | boolean | undefined>, forceRefresh = false): Observable<ApiResponse<unknown>> {
    const cacheKey = JSON.stringify(params || {});

    if (forceRefresh || !this.attendanceLogsCache.has(cacheKey)) {
      const request$ = this.get<ApiResponse<unknown>>(`${API_CONSTANTS.STAFF.BASE}/attendance-logs`, params).pipe(
        shareReplay(1)
      );
      this.attendanceLogsCache.set(cacheKey, request$);
    }

    return this.attendanceLogsCache.get(cacheKey)!;
  }

  clearCache(): void {
    this.staffCache$ = null;
    this.staffCacheLarge$ = null;
    this.unscopedStaffCache$ = null;
    this.membersCache.clear();
    this.measurementsCache.clear();
    this.staffLogsCache$ = null;
    this.staffBypassedLogsCache$ = null;
    this.staffDetailsCache.clear();
    this.attendanceLogsCache.clear();
  }
}
