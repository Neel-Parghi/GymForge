import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthApiService);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    return true;
  }

  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();
    const url = state.url;

    // Portal isolation: Prevent users from accessing other roles' layouts
    if (url.startsWith('/super-admin') && role !== 'SuperAdmin') {
      router.navigate(['/404'], { skipLocationChange: true });
      return false;
    }
    
    if (url.startsWith('/gym-owner') && role !== 'GymOwner' && role !== 'Staff') {
      router.navigate(['/404'], { skipLocationChange: true });
      return false;
    }

    if (url.startsWith('/trainer') && role !== 'Trainer') {
      router.navigate(['/404'], { skipLocationChange: true });
      return false;
    }

    if (url.startsWith('/user') && role !== 'User') {
      router.navigate(['/404'], { skipLocationChange: true });
      return false;
    }

    return true;
  }

  router.navigate(['/login']);
  return false;
};
