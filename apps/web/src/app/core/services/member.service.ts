import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay } from 'rxjs';
import { GymMember, MemberSubscription, OnboardMemberRequest, RenewSubscriptionRequest } from '../../shared/models/member.model';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService extends BaseApiService {

  constructor() {
    super();
  }

  private membersCache$: Observable<ApiResponse<GymMember[]>> | null = null;
  private lastGymId: string | null = null;

  onboardMember(gymId: string, payload: OnboardMemberRequest): Observable<ApiResponse<GymMember>> {
    return this.post<ApiResponse<GymMember>>(API_CONSTANTS.MEMBERS.ONBOARD.replace('{gymId}', gymId), payload);
  }

  getGymMembers(gymId: string): Observable<ApiResponse<GymMember[]>> {
    if (this.membersCache$ && this.lastGymId === gymId) {
      return this.membersCache$;
    }

    this.lastGymId = gymId;
    this.membersCache$ = this.get<ApiResponse<GymMember[]>>(API_CONSTANTS.MEMBERS.LIST.replace('{gymId}', gymId))
      .pipe(shareReplay(1));

    return this.membersCache$;
  }

  getMemberById(id: string): Observable<ApiResponse<GymMember>> {
    return this.get(`${API_CONSTANTS.MEMBERS.GET}/${id}`);
  }

  toggleMemberStatus(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.patch<ApiResponse<{ success: boolean }>>(API_CONSTANTS.MEMBERS.TOGGLE_STATUS.replace('{id}', id), {});
  }

  freezeMember(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.patch<ApiResponse<{ success: boolean }>>(API_CONSTANTS.MEMBERS.FREEZE.replace('{id}', id), {});
  }

  unfreezeMember(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.patch<ApiResponse<{ success: boolean }>>(API_CONSTANTS.MEMBERS.UNFREEZE.replace('{id}', id), {});
  }

  renewSubscription(id: string, payload: RenewSubscriptionRequest): Observable<ApiResponse<GymMember>> {
    return this.post<ApiResponse<GymMember>>(API_CONSTANTS.MEMBERS.RENEW.replace('{id}', id), payload);
  }

  updateMember(id: string, payload: Partial<OnboardMemberRequest>): Observable<ApiResponse<GymMember>> {
    return this.put<ApiResponse<GymMember>>(`${API_CONSTANTS.MEMBERS.UPDATE}/${id}`, payload);
  }

  deleteMember(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.delete<ApiResponse<{ success: boolean }>>(`${API_CONSTANTS.MEMBERS.DELETE}/${id}`);
  }

  getSubscriptionHistory(id: string): Observable<ApiResponse<MemberSubscription[]>> {
    return this.get<ApiResponse<MemberSubscription[]>>(API_CONSTANTS.MEMBERS.SUBSCRIPTION_HISTORY.replace('{id}', id));
  }

  exportMembers(gymId: string): Observable<Blob> {
    return this.getBlob(API_CONSTANTS.MEMBERS.EXPORT.replace('{gymId}', gymId));
  }

  clearCache(): void {
    this.membersCache$ = null;
    this.lastGymId = null;
  }

}
