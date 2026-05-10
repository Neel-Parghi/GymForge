import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AcceptInvitationComponent } from './features/auth/accept-invitation/accept-invitation.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/super-admin/dashboard/dashboard.component';
import { GymOwners } from './features/super-admin/gym-management/gym-owners/gym-owners.component';
import { GymList } from './features/super-admin/gym-management/gym-list/gym-list.component';
import { PricingList } from './features/super-admin/pricing/pricing-list/pricing-list.component';
import { authGuard } from './core/guards/auth-guard';
import { loggedInGuard } from './core/guards/logged-in.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loggedInGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loggedInGuard] },
  { path: 'accept-invitation', component: AcceptInvitationComponent, canActivate: [loggedInGuard] },
  {
    path: 'super-admin',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'gym-owners', component: GymOwners },
      { path: 'gym-list', component: GymList },
      { path: 'pricing', component: PricingList },
      {
        path: 'payments',
        loadComponent: () => import('./features/super-admin/payments/payments.component').then(m => m.PaymentsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/super-admin/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/super-admin/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'gym-owner',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/gym-owner/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/super-admin/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/super-admin/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'plans',
        loadComponent: () => import('./features/gym-owner/gym-plans/gym-plans.component').then(m => m.GymPlansComponent)
      },
      {
        path: 'members',
        loadComponent: () => import('./features/gym-owner/members/members-list.component').then(m => m.MembersListComponent)
      },
      {
        path: 'staff',
        loadComponent: () => import('./features/gym-owner/staff/staff-list.component').then(m => m.StaffListComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/gym-owner/inventory/inventory.component').then(m => m.InventoryComponent)
      }
    ]
  }
];
