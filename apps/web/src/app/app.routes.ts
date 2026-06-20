import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AcceptInvitationComponent } from './features/auth/accept-invitation/accept-invitation.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/super-admin/dashboard/dashboard.component';
import { GymOwners } from './features/super-admin/gym-management/gym-owners/gym-owners.component';
import { GymList } from './features/super-admin/gym-management/gym-list/gym-list.component';
import { PricingList } from './features/super-admin/pricing/pricing-list/pricing-list.component';
import { authGuard } from './core/guards/auth-guard';
import { loggedInGuard } from './core/guards/logged-in.guard';
import { subscriptionGuard } from './core/guards/subscription.guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loggedInGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loggedInGuard] },
  { path: 'accept-invitation', component: AcceptInvitationComponent, canActivate: [loggedInGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [loggedInGuard] },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'super-admin',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'users',
        loadComponent: () => import('./features/super-admin/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
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
    canActivate: [authGuard, subscriptionGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/gym-owner/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/super-admin/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'my-gyms',
        loadComponent: () => import('./features/gym-owner/my-gyms/my-gyms.component').then(m => m.MyGymsComponent),
        canActivate: [roleGuard]
      },
      {
        path: 'plans',
        loadComponent: () => import('./features/gym-owner/gym-plans/gym-plans.component').then(m => m.GymPlansComponent),
        canActivate: [roleGuard]
      },
      {
        path: 'members',
        loadComponent: () => import('./features/gym-owner/members/members-list.component').then(m => m.MembersListComponent),
        canActivate: [roleGuard]
      },
      {
        path: 'staff',
        loadComponent: () => import('./features/gym-owner/staff/staff-list.component').then(m => m.StaffListComponent),
        canActivate: [roleGuard]
      },
      {
        path: 'attendance',
        loadComponent: () => import('./features/gym-owner/attendance/attendance.component').then(m => m.AttendanceComponent),
        canActivate: [roleGuard]
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/gym-owner/inventory/inventory.component').then(m => m.InventoryComponent),
        canActivate: [roleGuard]
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/gym-owner/billing/billing.component').then(m => m.BillingComponent),
        canActivate: [roleGuard]
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/gym-owner/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [roleGuard]
      },
      {
        path: 'announcements',
        loadComponent: () => import('./features/gym-owner/announcements/announcements').then(m => m.Announcements),
        canActivate: [roleGuard]
      },
      {
        path: 'announcements/templates',
        loadComponent: () => import('./features/gym-owner/announcements/templates/templates').then(m => m.Templates),
        canActivate: [roleGuard]
      }
    ]
  },
  {
    path: 'trainer',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/trainer/dashboard/dashboard.component').then(m => m.TrainerDashboardComponent)
      },
      {
        path: 'members',
        loadComponent: () => import('./features/trainer/members/members.component').then(m => m.PTMembersTrackComponent)
      },
      {
        path: 'members/:memberId',
        loadComponent: () => import('./features/trainer/member-detail/member-detail.component').then(m => m.PTMemberDetailComponent)
      },
      {
        path: 'workout-planner',
        loadComponent: () => import('./features/trainer/workout-planner/workout-planner.component').then(m => m.WorkoutPlannerComponent)
      },
      {
        path: 'diet-planner',
        loadComponent: () => import('./features/trainer/diet-planner/diet-planner.component').then(m => m.PTDietPlannerComponent)
      },

      {
        path: 'settings',
        loadComponent: () => import('./features/trainer/trainer-settings/trainer-settings.component').then(m => m.TrainerSettingsComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./features/trainer/trainer-attendance/trainer-attendance.component').then(m => m.TrainerAttendanceComponent)
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/trainer/trainer-billing/trainer-billing.component').then(m => m.TrainerBillingComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/super-admin/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'user',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent)
      },
      {
        path: 'performance',
        loadComponent: () => import('./features/user/user-performance/user-performance').then(m => m.UserPerformance)
      },
      {
        path: 'workout-calendar',
        loadComponent: () => import('./features/user/user-workout-calendar/user-workout-calendar').then(m => m.UserWorkoutCalendar)
      },
      {
        path: 'workout-planner',
        loadComponent: () => import('./features/user/user-workout-planner/user-workout-planner').then(m => m.UserWorkoutPlanner)
      },
      {
        path: 'diet-planner',
        loadComponent: () => import('./features/user/user-diet-planner/user-diet-planner').then(m => m.UserDietPlanner)
      },
      {
        path: 'health-tracker',
        loadComponent: () => import('./features/user/user-health-tracker/user-health-tracker').then(m => m.UserHealthTracker)
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/user/user-billing/user-billing').then(m => m.UserBilling)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/user/user-settings/user-settings').then(m => m.UserSettings)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/super-admin/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'trainer',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/trainer/dashboard/dashboard.component').then(m => m.TrainerDashboardComponent)
      },
      {
        path: 'members',
        loadComponent: () => import('./features/trainer/members/members.component').then(m => m.PTMembersTrackComponent)
      },
      {
        path: 'members/:memberId',
        loadComponent: () => import('./features/trainer/member-detail/member-detail.component').then(m => m.PTMemberDetailComponent)
      },
      {
        path: 'plan-library',
        loadComponent: () => import('./features/trainer/plan-library/plan-library.component').then(m => m.PlanLibraryComponent)
      },
      {
        path: 'workout-planner',
        loadComponent: () => import('./features/trainer/workout-planner/workout-planner.component').then(m => m.WorkoutPlannerComponent)
      },
      {
        path: 'health-track',
        loadComponent: () => import('./features/trainer/health-track/health-track.component').then(m => m.HealthTrackerComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/trainer/settings/settings.component').then(m => m.TrainerSettingsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/super-admin/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'subscription-expired',
    loadComponent: () => import('./features/gym-owner/subscription-expired/subscription-expired.component').then(m => m.SubscriptionExpiredComponent),
    canActivate: [authGuard]
  }
];
