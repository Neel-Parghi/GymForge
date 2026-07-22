import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { GymAnnouncementRequest, GymAnnouncementResponse } from '../../shared/models/announcement.model';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService extends BaseApiService {
  private announcementsCache$: Observable<ApiResponse<GymAnnouncementResponse[]>> | null = null;
  private myGymAnnouncementsCache$: Observable<ApiResponse<GymAnnouncementResponse[]>> | null = null;

  constructor() {
    super();
  }

  getAnnouncements(): Observable<ApiResponse<GymAnnouncementResponse[]>> {
    if (!this.announcementsCache$) {
      this.announcementsCache$ = this.get<ApiResponse<GymAnnouncementResponse[]>>(API_CONSTANTS.ANNOUNCEMENTS.BASE).pipe(
        shareReplay(1)
      );
    }
    return this.announcementsCache$;
  }

  getMyGymAnnouncements(): Observable<ApiResponse<GymAnnouncementResponse[]>> {
    if (!this.myGymAnnouncementsCache$) {
      this.myGymAnnouncementsCache$ = this.get<ApiResponse<GymAnnouncementResponse[]>>(API_CONSTANTS.ANNOUNCEMENTS.MY_GYM).pipe(
        shareReplay(1)
      );
    }
    return this.myGymAnnouncementsCache$;
  }

  clearCache(): void {
    this.announcementsCache$ = null;
    this.myGymAnnouncementsCache$ = null;
  }

  createAnnouncement(dto: GymAnnouncementRequest): Observable<ApiResponse<GymAnnouncementResponse>> {
    return this.post<ApiResponse<GymAnnouncementResponse>>(API_CONSTANTS.ANNOUNCEMENTS.BASE, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  updateAnnouncement(id: string, dto: GymAnnouncementRequest): Observable<ApiResponse<GymAnnouncementResponse>> {
    return this.put<ApiResponse<GymAnnouncementResponse>>(`${API_CONSTANTS.ANNOUNCEMENTS.BASE}/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteAnnouncement(id: string): Observable<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`${API_CONSTANTS.ANNOUNCEMENTS.BASE}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }
}
