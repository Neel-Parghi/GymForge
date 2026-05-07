import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';
import { ThemeService } from '../../core/services/theme.service';
import { NavigationService } from '../../core/services/navigation.service';
import { NavItem } from '../../core/models/nav-Item.model';
import { ProfileService } from '../../core/services/profile.service';
import { API_CONSTANTS } from '../../core/constants/api-constants';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LoadingComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  private authApiService = inject(AuthApiService);
  private profileService = inject(ProfileService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private readonly navService = inject(NavigationService);

  roleName: string = '';
  dashboardRoute: string = '/super-admin/dashboard';
  profileRoute: string = '/super-admin/profile';
  isSidebarCollapsed = false;
  menuItems: NavItem[] = [];
  userProfile$ = this.authApiService.userProfile$;

  constructor() {
    this.menuItems = this.navService.getMenuItems();
  }

  ngOnInit(): void {
    this.setRoleName();
    this.profileService.getProfile().subscribe();
  }

  private setRoleName(): void {
    const decoded = this.authApiService.decodeToken();
    const role = decoded?.role || '';
    this.roleName = role.replace(/([A-Z])/g, ' $1').trim();

    // Set routes based on role
    if (role === 'GymOwner') {
      this.dashboardRoute = '/gym-owner/dashboard';
      this.profileRoute = '/gym-owner/profile';
    } else {
      this.dashboardRoute = '/super-admin/dashboard';
      this.profileRoute = '/super-admin/profile';
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleGroup(item: NavItem) {
    if (this.isSidebarCollapsed) {
      this.isSidebarCollapsed = false;
    }
    item.expanded = !item.expanded;
  }

  isGroupActive(item: NavItem): boolean {
    if (!item.children || item.children.length === 0) return false;
    const currentUrl = this.router.url.split(/[?#]/)[0].replace(/\/$/, "");
    return item.children.some(child => {
      if (!child.route) return false;
      const cleanRoute = child.route.replace(/\/$/, "");
      return currentUrl === cleanRoute || currentUrl.startsWith(cleanRoute + '/');
    });
  }

  getImageUrl(path: string | undefined): string | null {
    return this.profileService.getFullUrl(path);
  }

  get userInitials(): string {
    const profile = (this.authApiService as any).userProfileSubject?.value;
    if (profile) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }

    const decoded = this.authApiService.decodeToken();
    if (!decoded) return 'SA';
    const name = decoded?.unique_name || decoded?.name || decoded?.email || 'Super Admin';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout() {
    this.authApiService.logout();
  }
}
