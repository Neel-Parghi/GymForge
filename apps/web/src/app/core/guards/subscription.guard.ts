import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { GymService } from '../services/gym.service';
import { AuthApiService } from '../services/auth-api.service';
import { catchError, map, of } from 'rxjs';

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthApiService);
  const gymService = inject(GymService);

  if (authService.getUserRole() !== 'GymOwner') {
    return true;
  }
  if (state.url.includes('/subscription-expired')) {
    return true;
  }

  return gymService.getMyGym().pipe(
    map(res => {
      const gym = res?.data;
      if (gym) {
        if (gym.hasActiveSubscription) {
          return true;
        }
        if (gym.isTrialPlan && gym.subscriptionExpiry) {
          const expiryDate = new Date(gym.subscriptionExpiry);
          const now = new Date();
          if (now <= expiryDate) {
            return true;
          }
        }
        router.navigate(['/subscription-expired']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      return of(true);
    })
  );
};
