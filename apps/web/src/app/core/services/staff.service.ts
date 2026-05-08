import { Injectable, inject } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay, tap } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { StaffResponse, AddStaffRequest, MeasurementResponse, AddMeasurementRequest } from '../models/staff.model';

@Injectable({
  providedIn: 'root'
})
export class StaffService extends BaseApiService {

  private staffCache = new Map<string, Observable<ApiResponse<StaffResponse[]>>>();

  clearCache(gymId?: string): void {
    if (gymId) {
      this.staffCache.delete(gymId);
    } else {
      this.staffCache.clear();
    }
  }

  getGymStaff(gymId: string, forceRefresh = false): Observable<ApiResponse<StaffResponse[]>> {
    if (!this.staffCache.has(gymId) || forceRefresh) {
      const url = API_CONSTANTS.STAFF.LIST.replace('{gymId}', gymId);
      const obs = this.get<ApiResponse<StaffResponse[]>>(url).pipe(shareReplay(1));
      this.staffCache.set(gymId, obs);
    }
    return this.staffCache.get(gymId)!;
  }

  getStaffById(id: string): Observable<ApiResponse<StaffResponse>> {
    return this.get<ApiResponse<StaffResponse>>(`${API_CONSTANTS.STAFF.BASE}/${id}`);
  }

  addStaff(gymId: string, payload: AddStaffRequest): Observable<ApiResponse<StaffResponse>> {
    const url = API_CONSTANTS.STAFF.LIST.replace('{gymId}', gymId);
    return this.post<ApiResponse<StaffResponse>>(url, payload).pipe(
      tap(() => this.clearCache(gymId))
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

  getAssignedMembers(trainerId: string): Observable<ApiResponse<any[]>> {
    return this.get<ApiResponse<any[]>>(`${API_CONSTANTS.STAFF.BASE}/${trainerId}/members`);
  }

  assignTrainerToMember(trainerId: string, memberId: string, slot?: string): Observable<ApiResponse<any>> {
    let url = `${API_CONSTANTS.STAFF.BASE}/${trainerId}/assign-member/${memberId}`;
    if (slot) url += `?slot=${encodeURIComponent(slot)}`;
    return this.post<ApiResponse<any>>(url, {});
  }

  recordMeasurement(memberId: string, payload: AddMeasurementRequest): Observable<ApiResponse<any>> {
    const url = API_CONSTANTS.MEMBERS.MEASUREMENTS.replace('{memberId}', memberId);
    return this.post<ApiResponse<any>>(url, payload);
  }

  getMemberMeasurements(memberId: string): Observable<ApiResponse<MeasurementResponse[]>> {
    const url = API_CONSTANTS.MEMBERS.MEASUREMENTS.replace('{memberId}', memberId);
    return this.get<ApiResponse<MeasurementResponse[]>>(url);
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
}
