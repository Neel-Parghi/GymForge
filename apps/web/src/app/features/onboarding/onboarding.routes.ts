import { Routes } from '@angular/router';

export const ONBOARDING_ROUTES: Routes = [
  {
    path: 'owner',
    loadComponent: () => import('./owner-wizard/owner-wizard.component').then(m => m.OwnerWizardComponent)
  },
  {
    path: 'user',
    loadComponent: () => import('./user-wizard/user-wizard.component').then(m => m.UserWizardComponent)
  }
];
