import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';
import { ThemeService } from '../../core/services/theme.service';
import { NavigationService } from '../../core/services/navigation.service';
import { NavItem } from '../../core/models/nav-Item.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private authApiService = inject(AuthApiService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private readonly navService = inject(NavigationService);

  isSidebarCollapsed = false;
  menuItems: NavItem[] = [];

  constructor() {
    this.menuItems = this.navService.getMenuItems();
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

  get userInitials(): string {
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
