import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService extends BaseApiService {

  private router = inject(Router);

  constructor() {
    super();
  }

  login(credentials: any): Observable<any> {
    return this.post(API_CONSTANTS.AUTH.LOGIN, credentials).pipe(
      tap(res => this.saveTokens(res))
    );
  }

  register(userData: any): Observable<any> {
    return this.post(API_CONSTANTS.AUTH.REGISTER, userData).pipe(
      tap(res => this.saveTokens(res))
    );
  }

  getMe() {
    return this.get<any>('auth/me');
  }

  saveTokens(res: any) {
    const data = res?.Data || res?.data || res;
    if (data?.accessToken) localStorage.setItem('token', data.accessToken);
    if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  refreshToken(): Observable<any> {
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();
    return this.post(API_CONSTANTS.AUTH.REFRESH, { accessToken, refreshToken }).pipe(
      tap(res => this.saveTokens(res))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const decoded: any = this.decodeToken();
    if (!decoded) return null;
    return decoded['role'] || null;
  }

  decodeToken(): any {
    const token = this.getToken();
    if (!token || token === 'undefined' || token.split('.').length !== 3) {
      return null;
    }

    try {
      return jwtDecode(token);
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  redirectUserByRole() {
    const role = this.getUserRole();
    switch (role) {
      case 'SuperAdmin':
        this.router.navigate(['/super-admin/dashboard']);
        break;
      case 'Admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Trainer':
        this.router.navigate(['/trainer/dashboard']);
        break;
      case 'User':
        this.router.navigate(['/user/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
