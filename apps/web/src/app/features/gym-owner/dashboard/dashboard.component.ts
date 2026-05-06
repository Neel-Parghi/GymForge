import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GymOwnerStats } from '../../../core/services/gym-owner-dashboard.service';
import { GymOwnerDashboardService } from '../../../core/services/gym-owner-dashboard.service';
import { NotificationService } from '../../../core/services/notification.service';

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

        // Mock data for UI development if API is not ready
        this.stats = {
          totalMembers: 1250,
          activeMembers: 1180,
          frozenMembers: 45,
          newMembersThisMonth: 45,
          todayAttendance: 82,
          monthlyRevenue: 154000,
          pendingInvoices: 12,
          lowStockItems: 3,
          activeTrainers: 15
        };
      }
    });
  }

  getAttendancePercentage(): number {
    if (!this.stats) return 0;
    return Math.round((this.stats.todayAttendance / this.stats.activeMembers) * 100);
  }
}
