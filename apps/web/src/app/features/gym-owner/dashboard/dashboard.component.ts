import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GymOwnerStats } from '../../../core/models/dashboard.model';
import { GymOwnerDashboardService } from '../../../core/services/gym-owner-dashboard.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';
import { BranchContextService } from '../../../core/services/branch-context.service';

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
  private destroyRef = inject(DestroyRef);
  private branchContextService = inject(BranchContextService);

  stats: GymOwnerStats | null = null;
  isLoading = true;
  selectedDensityRange: 'today' | 'week' = 'today';
  todayDate = new Date();
  showDensityDropdown = false;

  toggleDensityDropdown() {
    this.showDensityDropdown = !this.showDensityDropdown;
  }

  selectDensityRange(range: 'today' | 'week') {
    this.selectedDensityRange = range;
    this.showDensityDropdown = false;
  }

  ngOnInit(): void {
    this.branchContextService.activeBranch$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.loadStats();
    });
  }

  loadStats(): void {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.stats = data;

        if (this.stats && (!this.stats.membershipDistribution || this.stats.membershipDistribution.length === 0)) {
          this.stats.membershipDistribution = [
            { tierName: '12 Month Plan', count: 8, percentage: 60, color: '#0b2545' },
            { tierName: '6 Month Plan', count: 3, percentage: 25, color: '#7a9acb' },
            { tierName: '1 Month Plan', count: 2, percentage: 15, color: '#d4e1fa' }
          ];
        }

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

  sendRenewalReminder(renewal: any, event: Event): void {
    event.stopPropagation();
    this.notification.success(`Renewal reminder sent to ${renewal.memberName} successfully!`);
  }

  formatTotalMembers(): string {
    const count = this.stats?.totalMembers || 0;
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  getDistributionCircleDash(index: number): string {
    if (!this.stats || !this.stats.membershipDistribution || !this.stats.membershipDistribution[index]) {
      return '0 377';
    }
    const item = this.stats.membershipDistribution[index];
    const circumference = 2 * Math.PI * 60;
    const length = (item.percentage / 100) * circumference;
    const remaining = circumference - length;
    return `${length} ${remaining}`;
  }

  getDistributionCircleOffset(index: number): number {
    if (!this.stats || !this.stats.membershipDistribution) {
      return 0;
    }
    const circumference = 2 * Math.PI * 60;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const item = this.stats.membershipDistribution[i];
      offset += (item.percentage / 100) * circumference;
    }
    return -offset;
  }

  getBarChartData() {
    if (this.selectedDensityRange === 'week') {
      if (!this.stats || !this.stats.weeklyOccupancy || this.stats.weeklyOccupancy.length === 0) {
        return [
          { hour: 'Mon', occupancyCount: 0, isActivePeak: false },
          { hour: 'Tue', occupancyCount: 0, isActivePeak: false },
          { hour: 'Wed', occupancyCount: 0, isActivePeak: false },
          { hour: 'Thu', occupancyCount: 0, isActivePeak: false },
          { hour: 'Fri', occupancyCount: 0, isActivePeak: false },
          { hour: 'Sat', occupancyCount: 0, isActivePeak: false },
          { hour: 'Sun', occupancyCount: 0, isActivePeak: false }
        ];
      }
      const maxVal = Math.max(...this.stats.weeklyOccupancy.map(d => d.occupancyCount), 1);
      return this.stats.weeklyOccupancy.map(item => ({
        hour: item.day,
        occupancyCount: item.occupancyCount,
        isActivePeak: item.occupancyCount > 0 && item.occupancyCount === maxVal
      }));
    }

    if (!this.stats || !this.stats.hourlyOccupancy || this.stats.hourlyOccupancy.length === 0) {
      return [
        { hour: '6 AM', occupancyCount: 22, isActivePeak: false },
        { hour: '8 AM', occupancyCount: 32, isActivePeak: false },
        { hour: '10 AM', occupancyCount: 18, isActivePeak: false },
        { hour: '12 PM', occupancyCount: 14, isActivePeak: false },
        { hour: '2 PM', occupancyCount: 22, isActivePeak: false },
        { hour: '4 PM', occupancyCount: 28, isActivePeak: false },
        { hour: '6 PM', occupancyCount: 45, isActivePeak: true },
        { hour: '8 PM', occupancyCount: 38, isActivePeak: false },
        { hour: '10 PM', occupancyCount: 15, isActivePeak: false }
      ];
    }

    const maxVal = Math.max(...this.stats.hourlyOccupancy.map(d => d.occupancyCount), 1);
    return this.stats.hourlyOccupancy.map(item => ({
      hour: item.hour,
      occupancyCount: item.occupancyCount,
      isActivePeak: item.occupancyCount === maxVal
    }));
  }

  getBarHeight(count: number): number {
    const data = this.getBarChartData();
    const maxVal = Math.max(...data.map(d => d.occupancyCount), 1);
    const heightVal = (count / maxVal) * 120;
    return heightVal > 15 ? heightVal : 15; // Minimum height for beautiful rounded rendering
  }

  getMemberTier(planName: string): string {
    if (!planName) return '1 MONTH';
    const name = planName.toLowerCase();
    if (name.includes('12') || name.includes('year') || name.includes('annual')) {
      return '12 MONTH';
    }
    if (name.includes('6') || name.includes('semi')) {
      return '6 MONTH';
    }
    return '1 MONTH';
  }
}
