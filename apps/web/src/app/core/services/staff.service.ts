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
  private membersCache: Map<string, Observable<ApiResponse<any[]>>> = new Map();
  private staffLogsCache$: Observable<ApiResponse<any>> | null = null;

  constructor() {
    super();
    this.branchContextService.activeBranch$.subscribe(() => {
      this.clearCache();
    });
  }


  getGymStaff(page: number = 1, pageSize: number = 10, searchTerm: string = '', forceRefresh = false): Observable<ApiResponse<PagedResponse<StaffResponse>>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (searchTerm || page !== 1 || pageSize !== 10 || forceRefresh) {
      const params: any = { pageNumber: page, pageSize };
      if (searchTerm) params.searchTerm = searchTerm;
      if (branchId) params.branchId = branchId;
      return this.get<ApiResponse<PagedResponse<StaffResponse>>>(API_CONSTANTS.STAFF.LIST, params);
    }

    if (!this.staffCache$) {
      const params: any = { pageNumber: 1, pageSize: 10 };
      if (branchId) params.branchId = branchId;
      this.staffCache$ = this.get<ApiResponse<PagedResponse<StaffResponse>>>(API_CONSTANTS.STAFF.LIST, params).pipe(
        shareReplay(1)
      );
    }
    return this.staffCache$;
  }

  getStaffById(id: string): Observable<ApiResponse<StaffResponse>> {
    return this.get<ApiResponse<StaffResponse>>(`${API_CONSTANTS.STAFF.BASE}/${id}`);
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

  updateStaff(id: string, payload: AddStaffRequest): Observable<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(`${API_CONSTANTS.STAFF.BASE}/${id}`, payload).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteStaff(id: string): Observable<ApiResponse<any>> {
    return this.delete<ApiResponse<any>>(`${API_CONSTANTS.STAFF.BASE}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  getAssignedMembers(trainerId: string, forceRefresh = false): Observable<ApiResponse<any[]>> {
    if (!this.membersCache.has(trainerId) || forceRefresh) {
      const request$ = this.get<ApiResponse<any[]>>(`${API_CONSTANTS.STAFF.BASE}/${trainerId}/members`).pipe(
        shareReplay(1)
      );
      this.membersCache.set(trainerId, request$);
    }
    return this.membersCache.get(trainerId)!;
  }

  assignTrainerToMember(trainerId: string, memberId: string, slot?: string, durationDays?: number): Observable<ApiResponse<any>> {
    let url = `${API_CONSTANTS.STAFF.BASE}/${trainerId}/assign-member/${memberId}?`;

    const params: string[] = [];

    if (slot)
      params.push(`slot=${encodeURIComponent(slot)}`);

    if (durationDays)
      params.push(`durationDays=${durationDays}`);

    url += params.join('&');

    return this.post<ApiResponse<any>>(url, {}).pipe(
      tap(() => this.membersCache.delete(trainerId))
    );
  }

  deallocateTrainerFromMember(trainerId: string, memberId: string): Observable<ApiResponse<any>> {
    const url = `${API_CONSTANTS.STAFF.BASE}/${trainerId}/deallocate-member/${memberId}`;
    return this.post<ApiResponse<any>>(url, {}).pipe(
      tap(() => this.membersCache.delete(trainerId))
    );
  }

  recordMeasurement(memberId: string, payload: AddMeasurementRequest): Observable<ApiResponse<any>> {
    const url = API_CONSTANTS.MEMBERS.MEASUREMENTS.replace('{memberId}', memberId);
    return this.post<ApiResponse<any>>(url, payload);
  }

  getMemberMeasurements(memberId: string): Observable<ApiResponse<MeasurementResponse[]>> {
    const url = API_CONSTANTS.MEMBERS.MEASUREMENTS.replace('{memberId}', memberId);
    return this.get<ApiResponse<MeasurementResponse[]>>(url);
  }

  checkInStaff(staffId: string, notes?: string): Observable<ApiResponse<StaffResponse>> {
    return this.post<ApiResponse<StaffResponse>>(`${API_CONSTANTS.STAFF.BASE}/${staffId}/check-in`, { notes }).pipe(
      tap(() => this.clearCache())
    );
  }

  checkOutStaff(staffId: string): Observable<ApiResponse<StaffResponse>> {
    return this.post<ApiResponse<StaffResponse>>(`${API_CONSTANTS.STAFF.BASE}/${staffId}/check-out`, {}).pipe(
      tap(() => this.clearCache())
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

  getStaffAttendanceLogs(params?: any, forceRefresh = false): Observable<ApiResponse<any>> {
    if (forceRefresh) {
      this.clearCache();
    }
    
    const isDefault = !params?.searchTerm &&
                      (!params?.status || params.status === 'all') &&
                      params?.pageNumber === 1 &&
                      params?.pageSize === 10 &&
                      !params?.date &&
                      !params?.bypassPagination;

    if (isDefault) {
      if (!this.staffLogsCache$) {
        this.staffLogsCache$ = this.get<ApiResponse<any>>(`${API_CONSTANTS.STAFF.BASE}/attendance-logs`, params).pipe(
          shareReplay(1)
        );
      }
      return this.staffLogsCache$;
    }

    return this.get<ApiResponse<any>>(`${API_CONSTANTS.STAFF.BASE}/attendance-logs`, params);
  }

  clearCache(): void {
    this.staffCache$ = null;
    this.membersCache.clear();
    this.staffLogsCache$ = null;
  }
}
