import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';
import { ThemeService } from '../../core/services/theme.service';

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

  isGymManagementExpanded = false;

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get currentTheme() {
    return this.themeService.getCurrentTheme();
  }

  logout() {
    this.authApiService.logout();
  }
}
