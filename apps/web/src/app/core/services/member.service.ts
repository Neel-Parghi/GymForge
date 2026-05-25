import { Injectable, inject } from '@angular/core';
import { AuthApiService } from './auth-api.service';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay, tap } from 'rxjs';
import { GymMember, MemberSubscription, OnboardMemberRequest, RenewSubscriptionRequest } from '../../shared/models/member.model';
import { ApiResponse } from '../../shared/models/api-response.model';
import { PagedResponse } from '../../shared/models/paged-response.model';
import { BranchContextService } from './branch-context.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService extends BaseApiService {

  private authService = inject(AuthApiService);
  private branchContextService = inject(BranchContextService);
  private membersListCache = new Map<string, Observable<ApiResponse<PagedResponse<GymMember>>>>();
  private memberCache = new Map<string, Observable<ApiResponse<GymMember>>>();
  private historyCache = new Map<string, Observable<ApiResponse<MemberSubscription[]>>>();

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

  onboardMember(payload: OnboardMemberRequest): Observable<ApiResponse<GymMember>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (branchId && !payload.branchId) {
      payload.branchId = branchId;
    }
    return this.post<ApiResponse<GymMember>>(API_CONSTANTS.MEMBERS.ONBOARD, payload).pipe(
      tap(() => this.clearCache())
    );
  }

  getGymMembers(pageNumber: number = 1, pageSize: number = 10, search: string = '', forceRefresh = false): Observable<ApiResponse<PagedResponse<GymMember>>> {
    const branchId = this.branchContextService.getActiveBranchId();

    if (search) {
      const params: any = { pageNumber, pageSize };
      params.searchTerm = search;
      if (branchId) params.branchId = branchId;
      return this.get<ApiResponse<PagedResponse<GymMember>>>(API_CONSTANTS.MEMBERS.LIST, params);
    }

    const cacheKey = `${pageNumber}-${pageSize}-${branchId || 'all'}`;

    if (forceRefresh || !this.membersListCache.has(cacheKey)) {
      const params: any = { pageNumber, pageSize };
      if (branchId) params.branchId = branchId;
      const request$ = this.get<ApiResponse<PagedResponse<GymMember>>>(API_CONSTANTS.MEMBERS.LIST, params).pipe(
        shareReplay(1)
      );
      this.membersListCache.set(cacheKey, request$);
    }

    return this.membersListCache.get(cacheKey)!;
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
    return this.patch<ApiResponse<{ success: boolean }>>(API_CONSTANTS.MEMBERS.TOGGLE_STATUS.replace('{id}', id), {}).pipe(
      tap(() => this.clearCache())
    );
  }

  freezeMember(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.patch<ApiResponse<{ success: boolean }>>(API_CONSTANTS.MEMBERS.FREEZE.replace('{id}', id), {}).pipe(
      tap(() => this.clearCache())
    );
  }

  unfreezeMember(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.patch<ApiResponse<{ success: boolean }>>(API_CONSTANTS.MEMBERS.UNFREEZE.replace('{id}', id), {}).pipe(
      tap(() => this.clearCache())
    );
  }

  renewSubscription(id: string, payload: RenewSubscriptionRequest): Observable<ApiResponse<GymMember>> {
    return this.post<ApiResponse<GymMember>>(API_CONSTANTS.MEMBERS.RENEW.replace('{id}', id), payload).pipe(
      tap(() => this.clearCache())
    );
  }

  updateMember(id: string, payload: Partial<OnboardMemberRequest>): Observable<ApiResponse<GymMember>> {
    return this.put<ApiResponse<GymMember>>(`${API_CONSTANTS.MEMBERS.UPDATE}/${id}`, payload).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteMember(id: string): Observable<ApiResponse<{ success: boolean }>> {
    return this.delete<ApiResponse<{ success: boolean }>>(`${API_CONSTANTS.MEMBERS.DELETE}/${id}`).pipe(
      tap(() => this.clearCache())
    );
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
    const branchId = this.branchContextService.getActiveBranchId();
    const params: any = {};
    if (branchId) {
      params.branchId = branchId;
    }
    return this.getBlob(API_CONSTANTS.MEMBERS.EXPORT, params);
  }

  clearCache(): void {
    this.membersListCache.clear();
    this.memberCache.clear();
    this.historyCache.clear();
  }

}
