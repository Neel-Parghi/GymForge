import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { AuthApiService } from './auth-api.service';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class GymSettingsService extends BaseApiService {
  private authService = inject(AuthApiService);
  private settingsSubject = new BehaviorSubject<Record<string, unknown> | null>(null);
  private holidaysCache$: Observable<ApiResponse<unknown>> | null = null;

  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    super();
    this.authService.userProfile$.subscribe(user => {
      if (!user) {
        this.settingsSubject.next(null);
        this.clearHolidaysCache();
      }
    });
  }

  getSettingsSync(): Record<string, unknown> | null {
    return this.settingsSubject.value;
  }

  loadSettings(): Observable<ApiResponse<unknown>> {
    return this.get<ApiResponse<unknown>>(API_CONSTANTS.GYM.SETTINGS).pipe(
      tap(res => {
        const data = (res?.data || res) as any;
        let roleRights: unknown = null;
        let operations: unknown = null;

        if (data?.roleRightsMatrixJson) {
          try {
            roleRights = JSON.parse(data.roleRightsMatrixJson);
          } catch (e) {
            console.error('Error parsing role rights', e);
          }
        }

        if (data?.planExpirationTriggerDays) {
          operations = { expiryWarningDays: data.planExpirationTriggerDays };
        }

        this.settingsSubject.next({ roleRights, operations });
      })
    );
  }

  updateSettings(payload: unknown, roleRightsMatrix: unknown, operationsSettings: unknown): Observable<ApiResponse<unknown>> {
    return this.put<ApiResponse<unknown>>(API_CONSTANTS.GYM.SETTINGS, payload).pipe(
      tap(() => {
        this.settingsSubject.next({ roleRights: roleRightsMatrix, operations: operationsSettings });
      })
    );
  }

  getHolidays(forceRefresh = false): Observable<ApiResponse<unknown>> {
    if (forceRefresh || !this.holidaysCache$) {
      this.holidaysCache$ = this.get<ApiResponse<unknown>>(API_CONSTANTS.GYM.HOLIDAYS).pipe(
        shareReplay(1)
      );
    }
    return this.holidaysCache$;
  }

  addHoliday(payload: unknown): Observable<ApiResponse<unknown>> {
    return this.post<ApiResponse<unknown>>(API_CONSTANTS.GYM.HOLIDAYS, payload).pipe(
      tap(() => this.clearHolidaysCache())
    );
  }

  deleteHoliday(holidayId: string): Observable<ApiResponse<unknown>> {
    return this.delete<ApiResponse<unknown>>(`${API_CONSTANTS.GYM.HOLIDAYS}/${holidayId}`).pipe(
      tap(() => this.clearHolidaysCache())
    );
  }

  clearHolidaysCache(): void {
    this.holidaysCache$ = null;
  }
}
