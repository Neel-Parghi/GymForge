import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthApiService } from './auth-api.service';

@Injectable({
  providedIn: 'root'
})
export class GymSettingsService extends BaseApiService {
  private authService = inject(AuthApiService);
  private settingsSubject = new BehaviorSubject<any>(null);
  
  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    super();
    this.authService.userProfile$.subscribe(user => {
      if (!user) {
        this.settingsSubject.next(null);
      }
    });
  }

  getSettingsSync(): any {
    return this.settingsSubject.value;
  }

  loadSettings(): Observable<any> {
    return this.get<any>('my-gym/settings').pipe(
      tap(res => {
        const data = res?.data || res;
        let roleRights: any = null;
        let operations: any = null;

        if (data?.roleRightsMatrixJson) {
          try {
            roleRights = JSON.parse(data.roleRightsMatrixJson);
          } catch (e) {
            console.error('Error parsing backend role rights matrix', e);
          }
        }
        
        if (data?.operationsSettingsJson) {
          try {
            operations = JSON.parse(data.operationsSettingsJson);
          } catch (e) {
            console.error('Error parsing backend operations settings', e);
          }
        }

        this.settingsSubject.next({ roleRights, operations });
      })
    );
  }

  updateSettings(roleRightsMatrix: any, operationsSettings: any): Observable<any> {
    const payload = {
      roleRightsMatrixJson: JSON.stringify(roleRightsMatrix),
      operationsSettingsJson: JSON.stringify(operationsSettings)
    };

    return this.put<any>('my-gym/settings', payload).pipe(
      tap(() => {
        this.settingsSubject.next({ roleRights: roleRightsMatrix, operations: operationsSettings });
      })
    );
  }

  getHolidays(): Observable<any> {
    return this.get<any>('my-gym/holidays');
  }

  addHoliday(payload: any): Observable<any> {
    return this.post<any>('my-gym/holidays', payload);
  }

  deleteHoliday(holidayId: string): Observable<any> {
    return this.delete<any>(`my-gym/holidays/${holidayId}`);
  }
}
