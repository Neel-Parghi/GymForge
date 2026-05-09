import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { UpdateUserProfile, UserProfile } from '../../shared/models/user-profile.model';
import { AuthApiService } from './auth-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseApiService {
  private authService = inject(AuthApiService);
  private profileCache$?: Observable<UserProfile>;

  constructor() {
    super();
    this.authService.userProfile$.subscribe(user => {
      if (!user) {
        this.clearProfileCache();
      }
    });
  }

  clearProfileCache(): void {
    this.profileCache$ = undefined;
  }

  getProfile(forceRefresh = false): Observable<UserProfile> {
    if (!this.profileCache$ || forceRefresh) {
      this.profileCache$ = this.get<UserProfile>(API_CONSTANTS.USER.PROFILE).pipe(
        tap(profile => {
          const data = (profile as any).data || profile;
          this.authService.setUserProfile(data);
        }),
        shareReplay(1)
      );
    }
    return this.profileCache$;
  }

  updateProfile(profile: UpdateUserProfile): Observable<any> {
    return this.put<any>(API_CONSTANTS.USER.UPDATE_PROFILE, profile).pipe(
      tap(() => this.clearProfileCache())
    );
  }

  changePassword(data: any): Observable<any> {
    return this.put(API_CONSTANTS.USER.CHANGE_PASSWORD, data);
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<any>(API_CONSTANTS.USER.UPLOAD_AVATAR, formData).pipe(
      tap(() => this.clearProfileCache())
    );
  }

  getFullUrl(path: string | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const baseUrl = API_CONSTANTS.BASE_URL.replace('/api', '');
    return `${baseUrl}${path}`;
  }
}
