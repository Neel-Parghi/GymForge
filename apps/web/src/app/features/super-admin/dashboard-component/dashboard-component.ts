import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent {
  stats = [
    { label: 'Total Gyms', value: '128', icon: 'fa-building', trend: '+12%', trendUp: true, color: '#3b82f6' },
    { label: 'Gym Owners', value: '94', icon: 'fa-users', trend: '+5%', trendUp: true, color: '#10b981' },
    { label: 'Active Members', value: '12,450', icon: 'fa-user-check', trend: '-2%', trendUp: false, color: '#6366f1' },
    { label: 'Platform Revenue', value: '$45,280', icon: 'fa-dollar-sign', trend: '+18%', trendUp: true, color: '#f59e0b' },
  ];

  recentRegistrations = [
    { id: 'REG-001', name: 'Elite Fitness', owner: 'Alex Rivera', date: '2024-03-28', status: 'Pending' },
    { id: 'REG-002', name: 'Titan Gym', owner: 'Sarah Chen', date: '2024-03-27', status: 'Approved' },
    { id: 'REG-003', name: 'Zest Yoga', owner: 'Marco Rossi', date: '2024-03-27', status: 'Pending' },
    { id: 'REG-004', name: 'Power House', owner: 'John Smith', date: '2024-03-26', status: 'Approved' },
    { id: 'REG-005', name: 'Flex Studio', owner: 'Emma Wilson', date: '2024-03-25', status: 'Approved' },
  ];

  getStatusClass(status: string) {
    return status === 'Approved' ? 'badge-approved' : 'badge-pending';
  }
}

