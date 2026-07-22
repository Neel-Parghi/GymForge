import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { UserNotificationResponse } from '../../shared/models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class UserNotificationApiService extends BaseApiService {
  private myNotificationsCache$: Observable<ApiResponse<UserNotificationResponse[]>> | null = null;

  constructor() {
    super();
  }

  getMyNotifications(): Observable<ApiResponse<UserNotificationResponse[]>> {
    if (!this.myNotificationsCache$) {
      this.myNotificationsCache$ = this.get<ApiResponse<UserNotificationResponse[]>>(API_CONSTANTS.USER_NOTIFICATIONS.BASE).pipe(
        shareReplay(1)
      );
    }
    return this.myNotificationsCache$;
  }

  clearCache(): void {
    this.myNotificationsCache$ = null;
  }

  markAsRead(id: string): Observable<ApiResponse<null>> {
    return this.post<ApiResponse<null>>(`${API_CONSTANTS.USER_NOTIFICATIONS.BASE}/${id}/read`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  markAllAsRead(): Observable<ApiResponse<null>> {
    return this.post<ApiResponse<null>>(`${API_CONSTANTS.USER_NOTIFICATIONS.BASE}/read-all`, {}).pipe(
      tap(() => this.clearCache())
    );
  }
}
