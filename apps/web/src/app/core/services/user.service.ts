import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap, catchError, of } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseApiService {
  constructor() {
    super();
  }

  inviteOwner(dto: any): Observable<any> {
    return this.post(API_CONSTANTS.USER.INVITE_OWNER, dto);
  }

  reInviteOwner(userId: string): Observable<any> {
    return this.post(`${API_CONSTANTS.USER.RE_INVITE}/${userId}`, {});
  }

  setPassword(dto: any): Observable<any> {
    return this.post(API_CONSTANTS.USER.SET_PASSWORD, dto);
  }

  validateInvitation(token: string): Observable<any> {
    return this.get(`${API_CONSTANTS.USER.VALIDATE_INVITATION}/${token}`, {});
  }

  getPreferences(): Observable<any> {
    return this.get(API_CONSTANTS.USER.PREFERENCES);
  }

  updatePreferences(dto: any): Observable<any> {
    return this.put(API_CONSTANTS.USER.PREFERENCES, dto);
  }

  getMySubscriptions(): Observable<any> {
    return this.get(API_CONSTANTS.USER.MY_SUBSCRIPTIONS);
  }

  private myGymCache$: Observable<any> | null = null;

  getMyGym(forceRefresh = false): Observable<any> {
    if (forceRefresh || !this.myGymCache$) {
      this.myGymCache$ = this.get(API_CONSTANTS.USER.MY_GYM).pipe(
        catchError(() => of({ success: true, data: null, message: 'No gym found' })),
        shareReplay(1)
      );
    }
    return this.myGymCache$;
  }

  getStandaloneUsers(pageNumber: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
    const params: any = { pageNumber, pageSize };
    if (searchTerm) {
      params.searchTerm = searchTerm;
    }
    return this.get(API_CONSTANTS.USER.STANDALONE, { params });
  }

  saveOnboardingStep(step: number): Observable<any> {
    return this.post(`${API_CONSTANTS.USER.SAVE_ONBOARDING_STEP}/${step}`, {});
  }

  completeOnboarding(payload: any): Observable<any> {
    return this.post(API_CONSTANTS.USER.COMPLETE_ONBOARDING, payload);
  }

  scheduleAccountDeletion(): Observable<any> {
    return this.post(API_CONSTANTS.USER.ACCOUNT_DELETION_SCHEDULE, {});
  }

  private dashboardCache$: Observable<any> | null = null;
  private routinesCache$: Observable<any> | null = null;

  getDashboardSummary(forceRefresh = false): Observable<any> {
    if (forceRefresh || !this.dashboardCache$) {
      this.dashboardCache$ = this.get(API_CONSTANTS.USER.DASHBOARD).pipe(shareReplay(1));
    }
    return this.dashboardCache$;
  }

  getDailyRoutines(forceRefresh = false): Observable<any> {
    if (forceRefresh || !this.routinesCache$) {
      this.routinesCache$ = this.get(API_CONSTANTS.USER.ROUTINES).pipe(shareReplay(1));
    }
    return this.routinesCache$;
  }

  clearCache(): void {
    this.dashboardCache$ = null;
    this.routinesCache$ = null;
    this.myGymCache$ = null;
  }

  createDailyRoutine(dto: any): Observable<any> {
    return this.post(API_CONSTANTS.USER.ROUTINES, dto).pipe(tap(() => this.clearCache()));
  }

  updateDailyRoutine(id: string, dto: any): Observable<any> {
    return this.put(`${API_CONSTANTS.USER.ROUTINES}/${id}`, dto).pipe(tap(() => this.clearCache()));
  }

  deleteDailyRoutine(id: string): Observable<any> {
    return this.delete(`${API_CONSTANTS.USER.ROUTINES}/${id}`).pipe(tap(() => this.clearCache()));
  }

  toggleDailyRoutine(id: string): Observable<any> {
    return this.patch(`${API_CONSTANTS.USER.ROUTINES}/${id}/toggle`, {}).pipe(tap(() => this.clearCache()));
  }
}
