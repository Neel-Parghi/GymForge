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
  // Enhanced stats for the new header row
  stats = {
    platformHealth: {
      value: '99.98%',
      status: 'OPTIMAL',
      subtext: 'Uptime last 30 days',
      icon: 'fa-check-circle'
    },
    totalRevenue: {
      value: '$4.2M',
      trend: '+12.4%',
      subtext: 'Platform-wide aggregate',
      sparkline: [30, 45, 35, 50, 40, 60, 55] // Mock data for SVG sparkline
    },
    subscriptions: {
      value: '12,402',
      renewalRate: '82%',
      target: '90%',
      progress: 82
    },
    totalGyms: {
      value: '842',
      trend: '+24 this week',
      owners: [
        { name: 'User 1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
        { name: 'User 2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
        { name: 'User 3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }
      ],
      extraCount: 839
    }
  };

  recentRegistrations = [
    { id: '1', name: 'Velocity Arena', owner: 'Sarah Jenkins', date: 'Oct 24, 2023', tier: 'Enterprise', status: 'Active', initials: 'V', color: '#e0f2fe' },
    { id: '2', name: 'Zenith Studio', owner: 'Mark Thompson', date: 'Oct 23, 2023', tier: 'Standard', status: 'Active', initials: 'Z', color: '#f0fdf4' },
    { id: '3', name: 'Iron Forge Elite', owner: 'Derrick Wu', date: 'Oct 22, 2023', tier: 'Enterprise', status: 'Pending', initials: 'I', color: '#fff7ed' },
  ];

  topBranches = [
    { name: 'Titan Fitness (NY)', members: '1,240', mrr: '$84k', trend: 'up', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=Titan' },
    { name: 'Luxe Wellness (LDN)', members: '890', mrr: '$62k', trend: 'up', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=Luxe' },
    { name: 'Summit Perf Lab', members: '760', mrr: '$51k', trend: 'neutral', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=Summit' },
  ];

  getSparklinePoints(data: number[]): string {
    const width = 100;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
  }
}

