import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = API_CONSTANTS.BASE_URL;

  inviteOwner(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${API_CONSTANTS.USER.INVITE_OWNER}`, dto);
  }

  reInviteOwner(userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}${API_CONSTANTS.USER.RE_INVITE}/${userId}`, {});
  }

  setPassword(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${API_CONSTANTS.USER.SET_PASSWORD}`, dto);
  }

  validateInvitation(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}${API_CONSTANTS.USER.VALIDATE_INVITATION}/${token}`);
  }
}
