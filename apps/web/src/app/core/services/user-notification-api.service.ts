import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserNotificationApiService extends BaseApiService {
  private myNotificationsCache$: Observable<any> | null = null;

  constructor() {
    super();
  }

  getMyNotifications(): Observable<any> {
    if (!this.myNotificationsCache$) {
      this.myNotificationsCache$ = this.get(API_CONSTANTS.USER_NOTIFICATIONS.BASE).pipe(
        shareReplay(1)
      );
    }
    return this.myNotificationsCache$;
  }

  clearCache(): void {
    this.myNotificationsCache$ = null;
  }

  markAsRead(id: string): Observable<any> {
    return this.post(`${API_CONSTANTS.USER_NOTIFICATIONS.BASE}/${id}/read`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  markAllAsRead(): Observable<any> {
    return this.post(`${API_CONSTANTS.USER_NOTIFICATIONS.BASE}/read-all`, {}).pipe(
      tap(() => this.clearCache())
    );
  }
}
