import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { API_CONSTANTS } from '../constants/api-constants';
import { UserProfile } from '../../shared/models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService extends BaseApiService {

  private router = inject(Router);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(this.loadStoredProfile());
  public userProfile$ = this.userProfileSubject.asObservable();

  getUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  constructor() {
    super();
  }

  private loadStoredProfile(): UserProfile | null {
    const stored = localStorage.getItem('userProfile') || sessionStorage.getItem('userProfile');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored user profile', e);
        return null;
      }
    }
    return null;
  }

  login(credentials: any, rememberMe: boolean = true): Observable<any> {
    return this.post(API_CONSTANTS.AUTH.LOGIN, credentials).pipe(
      tap(res => this.saveTokens(res, rememberMe))
    );
  }

  register(userData: any): Observable<any> {
    return this.post(API_CONSTANTS.AUTH.REGISTER, userData);
  }

  verifyOtp(data: { email: string, otpCode: string }): Observable<any> {
    return this.post(API_CONSTANTS.AUTH.VERIFY_OTP, data).pipe(
      tap(res => this.saveTokens(res, true))
    );
  }

  resendOtp(data: { email: string }): Observable<any> {
    return this.post(API_CONSTANTS.AUTH.RESEND_OTP, data);
  }

  forgotPassword(data: { email: string }): Observable<any> {
    const payload = { ...data, clientUri: window.location.origin + '/reset-password' };
    return this.post(API_CONSTANTS.AUTH.FORGOT_PASSWORD, payload);
  }

  resetPassword(data: { email: string; token: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.post(API_CONSTANTS.AUTH.RESET_PASSWORD, data);
  }

  getMe() {
    return this.get<any>(API_CONSTANTS.AUTH.ME);
  }

  saveTokens(res: any, rememberMe: boolean = true) {
    const data = res?.data || res;
    const storage = rememberMe ? localStorage : sessionStorage;

    if (rememberMe) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userProfile');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userProfile');
    }

    if (data?.accessToken) storage.setItem('token', data.accessToken);
    if (data?.refreshToken) storage.setItem('refreshToken', data.refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
  }

  refreshToken(): Observable<any> {
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();
    const rememberMe = !!localStorage.getItem('token');
    return this.post(API_CONSTANTS.AUTH.REFRESH, { accessToken, refreshToken }).pipe(
      tap(res => this.saveTokens(res, rememberMe))
    );
  }

  logout() {
    const refreshToken = this.getRefreshToken();
    const accessToken = this.getToken();

    if (refreshToken) {
      this.post(API_CONSTANTS.AUTH.LOGOUT, { accessToken, refreshToken }).subscribe({
        next: () => this.clearSession(),
        error: (err) => {
          this.clearSession();
        }
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userProfile');
    this.userProfileSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const decoded: any = this.decodeToken();
    if (!decoded) return null;
    return decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
  }

  getUserId(): string | null {
    const decoded: any = this.decodeToken();
    if (!decoded) return null;
    return decoded['userId'] || decoded['nameid'] || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded['sub'] || decoded['id'] || null;
  }

  getGymId(): string | null {
    const decoded: any = this.decodeToken();
    if (!decoded) return null;
    return decoded['gymId'] || null;
  }

  getAssignedBranchId(): string | null {
    const decoded: any = this.decodeToken();
    if (!decoded) return null;
    return decoded['branchId'] || null;
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
      case 'GymOwner':
      case 'Staff':
        this.router.navigate(['/gym-owner/dashboard']);
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

  setUserProfile(profile: UserProfile | null) {
    const rememberMe = !!localStorage.getItem('token');
    const storage = rememberMe ? localStorage : sessionStorage;

    if (profile) {
      storage.setItem('userProfile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('userProfile');
      sessionStorage.removeItem('userProfile');
    }
    this.userProfileSubject.next(profile);
  }
}
