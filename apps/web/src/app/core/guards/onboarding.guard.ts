import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';

export const onboardingGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthApiService);
  const router = inject(Router);

  let isOnboarded = false;
  let role = '';

  const currentUser = authService.getUserProfile();
  
  if (currentUser) {
    isOnboarded = currentUser.isOnboarded ?? false;
    role = currentUser.role;
  } else {
    const token = authService.decodeToken();
    if (token) {
      isOnboarded = token.isOnboarded === 'True' || token.isOnboarded === true;
      role = authService.getUserRole() || '';
    }
  }

  if (role) {
    if (!isOnboarded && role !== 'SuperAdmin') {
      // Allow them to go to onboarding route, but block others
      if (!state.url.includes('/onboarding')) {
        const roleRoute = role === 'GymOwner' ? '/onboarding/owner' : '/onboarding/user';
        router.navigate([roleRoute]);
        return false;
      }
      return true;
    } else {
      // If they are onboarded and try to access onboarding, redirect to dashboard
      if (state.url.includes('/onboarding')) {
        let dashboardRoute = '/login';
        if (role === 'GymOwner' || role === 'Staff') dashboardRoute = '/gym-owner/dashboard';
        else if (role === 'User') dashboardRoute = '/user/dashboard';
        else if (role === 'SuperAdmin') dashboardRoute = '/super-admin/dashboard';
        else if (role === 'Trainer') dashboardRoute = '/trainer/dashboard';

        router.navigate([dashboardRoute]);
        return false;
      }
      return true;
    }
  }

  return true;
};
