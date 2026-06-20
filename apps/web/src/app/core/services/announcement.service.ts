import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService extends BaseApiService {
  private announcementsCache$: Observable<any> | null = null;
  private myGymAnnouncementsCache$: Observable<any> | null = null;

  constructor() {
    super();
  }

  getAnnouncements(): Observable<any> {
    if (!this.announcementsCache$) {
      this.announcementsCache$ = this.get(API_CONSTANTS.ANNOUNCEMENTS.BASE).pipe(
        shareReplay(1)
      );
    }
    return this.announcementsCache$;
  }

  getMyGymAnnouncements(): Observable<any> {
    if (!this.myGymAnnouncementsCache$) {
      this.myGymAnnouncementsCache$ = this.get(API_CONSTANTS.ANNOUNCEMENTS.MY_GYM).pipe(
        shareReplay(1)
      );
    }
    return this.myGymAnnouncementsCache$;
  }

  clearCache(): void {
    this.announcementsCache$ = null;
    this.myGymAnnouncementsCache$ = null;
  }

  createAnnouncement(dto: any): Observable<any> {
    return this.post(API_CONSTANTS.ANNOUNCEMENTS.BASE, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  updateAnnouncement(id: string, dto: any): Observable<any> {
    return this.put(`${API_CONSTANTS.ANNOUNCEMENTS.BASE}/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteAnnouncement(id: string): Observable<any> {
    return this.delete(`${API_CONSTANTS.ANNOUNCEMENTS.BASE}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }
}
