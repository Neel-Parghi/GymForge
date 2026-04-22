import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login-component/login-component';
import { RegisterComponent } from './features/auth/register-component/register-component';
import { AcceptInvitationComponent } from './features/auth/accept-invitation/accept-invitation.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/super-admin/dashboard-component/dashboard-component';
import { GymOwners } from './features/super-admin/gym-management/gym-owners/gym-owners';
import { GymList } from './features/super-admin/gym-management/gym-list/gym-list';
import { PricingList } from './features/super-admin/pricing/pricing-list/pricing-list';
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
        loadComponent: () => import('./features/super-admin/payments/payments-component/payments-component').then(m => m.PaymentsComponent)
      }
    ]
  }
];
