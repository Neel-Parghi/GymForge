import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';

export const loggedInGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthApiService);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    return true;
  }

  if (authService.isAuthenticated()) {
    authService.redirectUserByRole();
    return false;
  }

  return true;
};
