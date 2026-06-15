import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseApiService {
  constructor() {
    super();
  }

  inviteOwner(dto: any): Observable<any> {
    return this.post(API_CONSTANTS.USER.INVITE_OWNER, dto);
  }

  reInviteOwner(userId: string): Observable<any> {
    return this.post(`${API_CONSTANTS.USER.RE_INVITE}/${userId}`, {});
  }

  setPassword(dto: any): Observable<any> {
    return this.post(API_CONSTANTS.USER.SET_PASSWORD, dto);
  }

  validateInvitation(token: string): Observable<any> {
    return this.get(`${API_CONSTANTS.USER.VALIDATE_INVITATION}/${token}`, {});
  }

  getMySubscriptions(): Observable<any> {
    return this.get(API_CONSTANTS.USER.MY_SUBSCRIPTIONS);
  }
}
