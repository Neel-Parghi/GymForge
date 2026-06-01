import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { StaffService } from '../../../core/services/staff.service';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class TrainerDashboardComponent implements OnInit {
  private authService = inject(AuthApiService);
  private staffService = inject(StaffService);
  private router = inject(Router);

  trainerName = 'Josh Cbum';
  todayDate = new Date();
  activeClientsCount = 0;
  completedSessions = 3;
  totalSessions = 5;

  stats = [
    { title: 'Active Clients', value: '12', icon: 'fa-users', color: 'blue' },
    { title: 'Today\'s Sessions', value: '3 / 5', icon: 'fa-calendar-check', color: 'green' },
    { title: 'Hours Logged', value: '6.5 hrs', icon: 'fa-clock', color: 'purple' },
    { title: 'PT Commissions', value: '₹14,500', icon: 'fa-indian-rupee-sign', color: 'amber' }
  ];

  todaySessions = [
    { time: '07:00 AM', memberName: 'Neel Parghi', planName: 'Weight Loss PT', status: 'Completed', initials: 'NP' },
    { time: '09:00 AM', memberName: 'Aarav Mehta', planName: 'Strength Training', status: 'Completed', initials: 'AM' },
    { time: '11:00 AM', memberName: 'Rohan Sharma', planName: 'Cardio Focus', status: 'Completed', initials: 'RS' },
    { time: '05:30 PM', memberName: 'Aditya Sen', planName: 'Muscle Hypertrophy', status: 'Upcoming', initials: 'AS' },
    { time: '07:00 PM', memberName: 'Kabir Dev', planName: 'Flexibility & Core', status: 'Upcoming', initials: 'KD' }
  ];

  quickStats = {
    gymUtilization: 42,
    activeAlerts: 1
  };

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.trainerName = `${profile.firstName} ${profile.lastName}`;
        this.loadTrainerData(profile.id);
      }
    });
  }

  loadTrainerData(trainerId: string): void {
    this.staffService.getAssignedMembers(trainerId).subscribe({
      next: (res: any) => {
        const list = res?.data || [];
        this.activeClientsCount = list.filter((x: any) => x.isActive).length;
        this.stats[0].value = this.activeClientsCount.toString();
      },
      error: (err) => {
        console.error('Error loading trainer assigned members:', err);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
