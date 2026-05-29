import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';
import { ThemeService } from '../../core/services/theme.service';
import { NavigationService } from '../../core/services/navigation.service';
import { NavItem } from '../../core/models/nav-Item.model';
import { ProfileService } from '../../core/services/profile.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { BranchContextService } from '../../core/services/branch-context.service';
import { GymService } from '../../core/services/gym.service';
import { GymSettingsService } from '../../core/services/gym-settings.service';

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
  private gymService = inject(GymService);
  private gymSettingsService = inject(GymSettingsService);

  roleName: string = '';
  dashboardRoute: string = '/super-admin/dashboard';
  profileRoute: string = '/super-admin/profile';
  isSidebarCollapsed = false;
  menuItems: NavItem[] = [];
  userProfile$ = this.authApiService.userProfile$;

  private branchContextService = inject(BranchContextService);
  activeBranch$ = this.branchContextService.activeBranch$;

  isGymOwner = false;
  isStaffLocked = false;
  branches: any[] = [];
  isBranchDropdownOpen = false;

  constructor() {
    this.menuItems = this.navService.getMenuItems();
  }

  ngOnInit(): void {
    this.setRoleName();
    this.profileService.getProfile().subscribe();

    // Preload gym settings and permissions matrix from backend
    const currentRole = this.authApiService.getUserRole();
    if (currentRole === 'GymOwner' || currentRole === 'Staff' || currentRole === 'Trainer') {
      this.gymSettingsService.loadSettings().subscribe({
        next: () => {
          this.menuItems = this.navService.getMenuItems();
        },
        error: (err) => console.error('Failed to load dynamic gym settings', err)
      });
    }
    
    const assignedBranchId = this.authApiService.getAssignedBranchId();
    if (assignedBranchId) {
      this.isStaffLocked = true;
      this.gymService.getMyBranches().subscribe({
        next: (res) => {
          this.branches = res.data || [];
          const matchedBranch = this.branches.find(b => b.id === assignedBranchId);
          if (matchedBranch) {
            this.branchContextService.setActiveBranch({ id: matchedBranch.id, name: matchedBranch.name });
          } else {
            this.branchContextService.setActiveBranch({ id: assignedBranchId, name: 'Assigned Location' });
          }
        }
      });
    } else if (this.isGymOwner) {
      this.loadBranches();
    }
  }

  private setRoleName(): void {
    const decoded = this.authApiService.decodeToken();
    const role = decoded?.role || '';
    this.roleName = role.replace(/([A-Z])/g, ' $1').trim();
    this.isGymOwner = role === 'GymOwner';

    if (role === 'GymOwner') {
      this.dashboardRoute = '/gym-owner/dashboard';
      this.profileRoute = '/gym-owner/profile';
    } else {
      this.dashboardRoute = '/super-admin/dashboard';
      this.profileRoute = '/super-admin/profile';
    }
  }

  loadBranches(): void {
    this.gymService.getMyBranches().subscribe({
      next: (res) => {
        this.branches = res.data || [];
      }
    });
  }

  selectBranch(branch: any | null): void {
    if (branch) {
      this.branchContextService.setActiveBranch({ id: branch.id, name: branch.name });
    } else {
      this.branchContextService.setActiveBranch(null);
    }
    this.isBranchDropdownOpen = false;
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

  @HostListener('document:click')
  closeDropdowns() {
    this.isBranchDropdownOpen = false;
  }
}
