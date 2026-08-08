import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';

interface BottomNavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-user-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './user-bottom-nav.component.html',
  styleUrl: './user-bottom-nav.component.scss'
})
export class UserBottomNavComponent {
  private authApiService = inject(AuthApiService);
  private router = inject(Router);

  isMoreOpen = false;

  readonly tabs: BottomNavItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-house', route: '/user/dashboard' },
    { label: 'Calendar', icon: 'fa-solid fa-calendar-days', route: '/user/workout-calendar' },
    { label: 'Track', icon: 'fa-solid fa-chart-line', route: '/user/performance' },
    { label: 'Diet', icon: 'fa-solid fa-clipboard-list', route: '/user/diet-tracker' }
  ];

  readonly moreItems: BottomNavItem[] = [
    { label: 'Workout Planner', icon: 'fa-solid fa-calendar-check', route: '/user/workout-planner' },
    { label: 'Diet Planner', icon: 'fa-solid fa-utensils', route: '/user/diet-planner' },
    { label: 'Health Tracker', icon: 'fa-solid fa-heart-pulse', route: '/user/health-tracker' },
    { label: 'My Account', icon: 'fa-solid fa-user-circle', route: '/user/profile' },
    { label: 'Billing & Payments', icon: 'fa-solid fa-file-invoice-dollar', route: '/user/billing' },
    { label: 'Settings', icon: 'fa-solid fa-gear', route: '/user/settings' }
  ];

  toggleMore(event: Event): void {
    event.stopPropagation();
    this.isMoreOpen = !this.isMoreOpen;
  }

  closeMore(): void {
    this.isMoreOpen = false;
  }

  navigateFromSheet(route: string): void {
    this.closeMore();
    this.router.navigateByUrl(route);
  }

  logout(): void {
    this.closeMore();
    this.authApiService.logout();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMore();
  }
}
