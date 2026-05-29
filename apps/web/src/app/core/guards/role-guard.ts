import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';
import { NotificationService } from '../services/notification.service';
import { GymSettingsService } from '../services/gym-settings.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthApiService);
  const router = inject(Router);
  const notification = inject(NotificationService);
  const settingsService = inject(GymSettingsService);

  const role = authService.getUserRole();

  // If not logged in, redirect to login page
  if (!role) {
    router.navigate(['/login']);
    return false;
  }

  // SuperAdmin and GymOwner bypass matrix restrictions entirely
  if (role === 'SuperAdmin' || role === 'GymOwner') {
    return true;
  }

  const url = state.url.split(/[?#]/)[0];

  // Core administrative paths restricted exclusively to owners
  if (url.includes('/gym-owner/settings') || url.includes('/gym-owner/my-gyms')) {
    notification.error('Access Denied: Settings & Branch Management are restricted to the Gym Owner.');
    router.navigate(['/gym-owner/dashboard']);
    return false;
  }

  // Dynamic modules map
  const moduleMap: { [key: string]: string } = {
    '/gym-owner/dashboard': 'dashboard',
    '/gym-owner/members': 'members',
    '/gym-owner/attendance': 'attendance',
    '/gym-owner/staff': 'staff',
    '/gym-owner/plans': 'plans',
    '/gym-owner/inventory': 'inventory',
    '/gym-owner/billing': 'billing'
  };

  // Find requested module key
  let matchedModKey: string | null = null;
  for (const pathKey of Object.keys(moduleMap)) {
    if (url.startsWith(pathKey)) {
      matchedModKey = moduleMap[pathKey];
      break;
    }
  }

  if (matchedModKey) {
    const cachedSettings = settingsService.getSettingsSync();
    const savedRights = cachedSettings?.roleRights || {};

    const matrixKey = `${role}_${matchedModKey}`;

    let defaultValue = true;
    if (role === 'Trainer') {
      defaultValue = matchedModKey === 'dashboard' || matchedModKey === 'members' || matchedModKey === 'attendance';
    } else if (role === 'Staff') {
      defaultValue = matchedModKey === 'dashboard' || matchedModKey === 'members' || matchedModKey === 'attendance' || matchedModKey === 'inventory';
    }

    const hasAccess = savedRights[matrixKey] !== undefined ? savedRights[matrixKey] : defaultValue;

    if (!hasAccess) {
      const moduleName = matchedModKey.charAt(0).toUpperCase() + matchedModKey.slice(1);
      notification.error(`Access Denied: You do not have permission to access the ${moduleName} module.`);
      router.navigate(['/gym-owner/dashboard']);
      return false;
    }
  }

  return true;
};
