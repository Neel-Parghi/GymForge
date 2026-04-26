import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { UpdateUserProfile, UserProfile } from '../../shared/models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseApiService {

  constructor() {
    super();
  }

  getProfile(): Observable<UserProfile> {
    return this.get<UserProfile>(API_CONSTANTS.USER.PROFILE);
  }

  updateProfile(profile: UpdateUserProfile): Observable<any> {
    return this.put<any>(API_CONSTANTS.USER.UPDATE_PROFILE, profile);
  }

  changePassword(data: any): Observable<any> {
    return this.put(API_CONSTANTS.USER.CHANGE_PASSWORD, data);
  }
}
