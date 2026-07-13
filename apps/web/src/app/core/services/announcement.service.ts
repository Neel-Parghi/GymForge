import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService extends BaseApiService {
  private announcementsCache$: Observable<ApiResponse<unknown>> | null = null;
  private myGymAnnouncementsCache$: Observable<ApiResponse<unknown>> | null = null;

  constructor() {
    super();
  }

  getAnnouncements(): Observable<ApiResponse<unknown>> {
    if (!this.announcementsCache$) {
      this.announcementsCache$ = this.get<ApiResponse<unknown>>(API_CONSTANTS.ANNOUNCEMENTS.BASE).pipe(
        shareReplay(1)
      );
    }
    return this.announcementsCache$;
  }

  getMyGymAnnouncements(): Observable<ApiResponse<unknown>> {
    if (!this.myGymAnnouncementsCache$) {
      this.myGymAnnouncementsCache$ = this.get<ApiResponse<unknown>>(API_CONSTANTS.ANNOUNCEMENTS.MY_GYM).pipe(
        shareReplay(1)
      );
    }
    return this.myGymAnnouncementsCache$;
  }

  clearCache(): void {
    this.announcementsCache$ = null;
    this.myGymAnnouncementsCache$ = null;
  }

  createAnnouncement(dto: unknown): Observable<ApiResponse<unknown>> {
    return this.post<ApiResponse<unknown>>(API_CONSTANTS.ANNOUNCEMENTS.BASE, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  updateAnnouncement(id: string, dto: unknown): Observable<ApiResponse<unknown>> {
    return this.put<ApiResponse<unknown>>(`${API_CONSTANTS.ANNOUNCEMENTS.BASE}/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteAnnouncement(id: string): Observable<ApiResponse<unknown>> {
    return this.delete<ApiResponse<unknown>>(`${API_CONSTANTS.ANNOUNCEMENTS.BASE}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }
}
