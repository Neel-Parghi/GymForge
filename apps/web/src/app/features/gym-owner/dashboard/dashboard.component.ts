import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GymOwnerStats } from '../../../core/services/gym-owner-dashboard.service';
import { GymOwnerDashboardService } from '../../../core/services/gym-owner-dashboard.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gym-owner-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(GymOwnerDashboardService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  stats: GymOwnerStats | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.notification.error('Failed to load dashboard statistics.');
        this.isLoading = false;
      }
    });
  }

  getAttendancePercentage(): number {
    if (!this.stats) return 0;
    return Math.round((this.stats.todayAttendance / this.stats.activeMembers) * 100);
  }

  navigateToInventory(filter?: string): void {
    const queryParams: any = {};
    if (filter === 'lowStock') {
      queryParams.tab = 'inventory';
      queryParams.filter = 'lowStock';
    } else if (filter === 'maintenance') {
      queryParams.tab = 'equipment';
      queryParams.filter = 'maintenance';
    }
    this.router.navigate(['/gym-owner/inventory'], { queryParams });
  }

  navigateToMembers(): void {
    this.router.navigate(['/gym-owner/members']);
  }
}
