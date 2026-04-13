import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login-component/login-component';
import { RegisterComponent } from './features/auth/register-component/register-component';
import { AcceptInvitationComponent } from './features/auth/accept-invitation/accept-invitation.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/super-admin/dashboard-component/dashboard-component';
import { GymOwners } from './features/super-admin/gym-management/gym-owners/gym-owners';
import { GymList } from './features/super-admin/gym-management/gym-list/gym-list';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'accept-invitation', component: AcceptInvitationComponent },
  { 
    path: 'super-admin', 
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'gym-owners', component: GymOwners },
      { path: 'gym-list', component: GymList }
    ]
  }
];
