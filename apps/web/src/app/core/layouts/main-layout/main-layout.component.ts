import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MenuItem } from '../../../shared/models/menu-item.model';
import { SidebarComponent } from '../sidebar/sidebar-component';
import { RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  menuItems: MenuItem[] = [];
  isClientReady = false;

  constructor(
    private authService: AuthApiService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    // Delay menu generation until we are in the browser to avoid hydration mismatch
    if (isPlatformBrowser(this.platformId)) {
      this.isClientReady = true;
      this.generateMenu();
    }
  }

  generateMenu() {
    const role = this.authService.getUserRole();
    
    if (role === 'SuperAdmin') {
      this.menuItems = [
        { label: 'Dashboard', icon: 'bi bi-speedometer2', route: '/super-admin/dashboard' },
        { 
          label: 'Gym Management', 
          icon: 'bi bi-building',
          expanded: true,
          children: [
            { label: 'Gym List', icon: '', route: '/super-admin/gyms' },
            { label: 'Gym Owners', icon: '', route: '/super-admin/owners' }
          ]
        }
      ];
    } else if (role === 'Admin') {
       this.menuItems = [
        { label: 'Dashboard', icon: 'bi bi-speedometer2', route: '/admin/dashboard' }
       ];
    }
    // Add other roles as needed
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
