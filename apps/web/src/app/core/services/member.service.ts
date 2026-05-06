import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable } from 'rxjs';
import { GymMember, MemberSubscription, OnboardMemberRequest, RenewSubscriptionRequest } from '../../shared/models/member.model';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService extends BaseApiService {

  constructor() {
    super();
  }

  onboardMember(gymId: string, createdBy: string, payload: OnboardMemberRequest): Observable<GymMember> {
    return this.post(`${API_CONSTANTS.MEMBERS.ONBOARD}/${gymId}/${createdBy}`, payload);
  }

  getGymMembers(gymId: string): Observable<ApiResponse<GymMember[]>> {
    return this.get(`${API_CONSTANTS.MEMBERS.LIST}/${gymId}`);
  }

  getMemberById(id: string): Observable<ApiResponse<GymMember>> {
    return this.get(`${API_CONSTANTS.MEMBERS.GET}/${id}`);
  }

  toggleMemberStatus(id: string): Observable<{ success: boolean }> {
    return this.put(API_CONSTANTS.MEMBERS.TOGGLE_STATUS.replace('{id}', id), {});
  }

  freezeMember(id: string, updatedBy: string): Observable<{ success: boolean }> {
    return this.put(API_CONSTANTS.MEMBERS.FREEZE.replace('{id}', id) + `/${updatedBy}`, {});
  }

  unfreezeMember(id: string, updatedBy: string): Observable<{ success: boolean }> {
    return this.put(API_CONSTANTS.MEMBERS.UNFREEZE.replace('{id}', id) + `/${updatedBy}`, {});
  }

  renewSubscription(id: string, updatedBy: string, payload: RenewSubscriptionRequest): Observable<GymMember> {
    return this.post(API_CONSTANTS.MEMBERS.RENEW.replace('{id}', id) + `/${updatedBy}`, payload);
  }

  updateMember(id: string, updatedBy: string, payload: Partial<OnboardMemberRequest>): Observable<GymMember> {
    return this.put(`${API_CONSTANTS.MEMBERS.UPDATE}/${id}/${updatedBy}`, payload);
  }
}
