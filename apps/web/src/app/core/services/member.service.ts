import { Injectable, inject } from '@angular/core';
import { AuthApiService } from './auth-api.service';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay } from 'rxjs';
import { GymMember, MemberSubscription, OnboardMemberRequest, RenewSubscriptionRequest } from '../../shared/models/member.model';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService extends BaseApiService {

  private authService = inject(AuthApiService);

  constructor() {
    super();
    this.authService.userProfile$.subscribe(user => {
      if (!user) {
        this.clearCache();
      }
    });
  }

  private membersCache$: Observable<ApiResponse<GymMember[]>> | null = null;
  private memberCache = new Map<string, Observable<ApiResponse<GymMember>>>();
  private historyCache = new Map<string, Observable<ApiResponse<MemberSubscription[]>>>();
  
  onboardMember(payload: OnboardMemberRequest): Observable<ApiResponse<GymMember>> {
    return this.post<ApiResponse<GymMember>>(API_CONSTANTS.MEMBERS.ONBOARD, payload);
  }

  getGymMembers(): Observable<ApiResponse<GymMember[]>> {
    if (this.membersCache$) {
      return this.membersCache$;
    }

    this.membersCache$ = this.get<ApiResponse<GymMember[]>>(API_CONSTANTS.MEMBERS.LIST)
      .pipe(shareReplay(1));

    return this.membersCache$;
  }

  getMemberById(id: string): Observable<ApiResponse<GymMember>> {
    if (this.memberCache.has(id)) {
      return this.memberCache.get(id)!;
    }

    const obs = this.get<ApiResponse<GymMember>>(`${API_CONSTANTS.MEMBERS.GET}/${id}`)
      .pipe(shareReplay(1));
    this.memberCache.set(id, obs);
    return obs;
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
    if (this.historyCache.has(id)) {
      return this.historyCache.get(id)!;
    }

    const obs = this.get<ApiResponse<MemberSubscription[]>>(API_CONSTANTS.MEMBERS.SUBSCRIPTION_HISTORY.replace('{id}', id))
      .pipe(shareReplay(1));
    this.historyCache.set(id, obs);
    return obs;
  }

  exportMembers(): Observable<Blob> {
    return this.getBlob(API_CONSTANTS.MEMBERS.EXPORT);
  }

  clearCache(): void {
    this.membersCache$ = null;
    this.memberCache.clear();
    this.historyCache.clear();
  }

}
