import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthApiService } from './auth-api.service';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class GymSettingsService extends BaseApiService {
  private authService = inject(AuthApiService);
  private settingsSubject = new BehaviorSubject<any>(null);
  private holidaysCache$: Observable<any> | null = null;

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

  getSettingsSync(): any {
    return this.settingsSubject.value;
  }

  loadSettings(): Observable<any> {
    return this.get<any>(API_CONSTANTS.GYM.SETTINGS).pipe(
      tap(res => {
        const data = res?.data || res;
        let roleRights: any = null;
        let operations: any = null;

        if (data?.roleRightsMatrixJson) {
          try {
            roleRights = JSON.parse(data.roleRightsMatrixJson);
          } catch (e) {
            console.error('Error parsing role rights matrix', e);
          }
        }

        if (data?.planExpirationTriggerDays) {
          operations = { expiryWarningDays: data.planExpirationTriggerDays };
        }

        this.settingsSubject.next({ roleRights, operations });
      })
    );
  }

  updateSettings(payload: any, roleRightsMatrix: any, operationsSettings: any): Observable<any> {
    return this.put<any>(API_CONSTANTS.GYM.SETTINGS, payload).pipe(
      tap(() => {
        this.settingsSubject.next({ roleRights: roleRightsMatrix, operations: operationsSettings });
      })
    );
  }

  getHolidays(forceRefresh = false): Observable<any> {
    if (forceRefresh || !this.holidaysCache$) {
      this.holidaysCache$ = this.get<any>(API_CONSTANTS.GYM.HOLIDAYS).pipe(
        shareReplay(1)
      );
    }
    return this.holidaysCache$;
  }

  addHoliday(payload: any): Observable<any> {
    return this.post<any>(API_CONSTANTS.GYM.HOLIDAYS, payload).pipe(
      tap(() => this.clearHolidaysCache())
    );
  }

  deleteHoliday(holidayId: string): Observable<any> {
    return this.delete<any>(`${API_CONSTANTS.GYM.HOLIDAYS}/${holidayId}`).pipe(
      tap(() => this.clearHolidaysCache())
    );
  }

  clearHolidaysCache(): void {
    this.holidaysCache$ = null;
  }
}
