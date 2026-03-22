import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService extends BaseApiService {

  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  constructor() {
    super();
  }

  login(credentials: any): Observable<any> {
    return this.post(API_CONSTANTS.AUTH.LOGIN, credentials);
  }

  register(userData: any): Observable<any> {
    return this.post(API_CONSTANTS.AUTH.REGISTER, userData);
  }

  getMe() {
    return this.get<any>('auth/me');
  }

  saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
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
    console.log(role);
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
