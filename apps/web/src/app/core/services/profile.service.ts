import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, shareReplay, tap, from, switchMap } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { ApiResponse } from '../../shared/models/api-response.model';
import { UpdateUserProfile, UserProfile, UploadAvatarResponseDto } from '../../shared/models/user-profile.model';
import { AuthApiService } from './auth-api.service';
import { ChangePasswordRequestDto } from '../../shared/models/auth.model';
import { compressImage } from '../../shared/utils/image-compressor';

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
      this.profileCache$ = new Observable<UserProfile>(observer => {
        this.get<ApiResponse<UserProfile>>(API_CONSTANTS.USER.PROFILE).subscribe({
          next: (response) => {
            const profile = response.data || (response as unknown as UserProfile);
            this.authService.setUserProfile(profile);
            observer.next(profile);
            observer.complete();
          },
          error: (err) => observer.error(err)
        });
      }).pipe(shareReplay(1));
    }
    return this.profileCache$;
  }

  updateProfile(profile: UpdateUserProfile): Observable<ApiResponse<UserProfile>> {
    return this.put<ApiResponse<UserProfile>>(API_CONSTANTS.USER.UPDATE_PROFILE, profile).pipe(
      tap(() => this.clearProfileCache())
    );
  }

  changePassword(data: ChangePasswordRequestDto): Observable<ApiResponse<null>> {
    return this.put<ApiResponse<null>>(API_CONSTANTS.USER.CHANGE_PASSWORD, data);
  }

  uploadAvatar(file: File): Observable<ApiResponse<UploadAvatarResponseDto>> {
    return from(compressImage(file)).pipe(
      switchMap(compressedFile => {
        const formData = new FormData();
        formData.append('file', compressedFile);
        return this.post<ApiResponse<UploadAvatarResponseDto>>(API_CONSTANTS.USER.UPLOAD_AVATAR, formData);
      }),
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
