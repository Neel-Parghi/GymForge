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

  onboardMember(gymId: string, payload: OnboardMemberRequest): Observable<GymMember> {
    return this.post(API_CONSTANTS.MEMBERS.ONBOARD.replace('{gymId}', gymId), payload);
  }

  private membersCache$: Observable<ApiResponse<GymMember[]>> | null = null;
  private lastGymId: string | null = null;

  getGymMembers(gymId: string): Observable<ApiResponse<GymMember[]>> {
    if (this.membersCache$ && this.lastGymId === gymId) {
      return this.membersCache$;
    }
    
    this.lastGymId = gymId;
    this.membersCache$ = this.get<ApiResponse<GymMember[]>>(API_CONSTANTS.MEMBERS.LIST.replace('{gymId}', gymId))
      .pipe(shareReplay(1));
      
    return this.membersCache$;
  }

  // Clear cache when data is modified
  clearCache(): void {
    this.membersCache$ = null;
    this.lastGymId = null;
  }

  getMemberById(id: string): Observable<ApiResponse<GymMember>> {
    return this.get(`${API_CONSTANTS.MEMBERS.GET}/${id}`);
  }

  toggleMemberStatus(id: string): Observable<{ success: boolean }> {
    return this.patch(API_CONSTANTS.MEMBERS.TOGGLE_STATUS.replace('{id}', id), {});
  }

  freezeMember(id: string): Observable<{ success: boolean }> {
    return this.patch(API_CONSTANTS.MEMBERS.FREEZE.replace('{id}', id), {});
  }

  unfreezeMember(id: string): Observable<{ success: boolean }> {
    return this.patch(API_CONSTANTS.MEMBERS.UNFREEZE.replace('{id}', id), {});
  }

  renewSubscription(id: string, payload: RenewSubscriptionRequest): Observable<GymMember> {
    return this.post(API_CONSTANTS.MEMBERS.RENEW.replace('{id}', id), payload);
  }

  updateMember(id: string, payload: Partial<OnboardMemberRequest>): Observable<GymMember> {
    return this.put(`${API_CONSTANTS.MEMBERS.UPDATE}/${id}`, payload);
  }
}
