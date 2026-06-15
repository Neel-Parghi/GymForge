import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, DropdownComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.chart && this.chart.chart && this.chart.chart.ctx) {
        const ctx = this.chart.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
        
        const lineGradient = ctx.createLinearGradient(0, 0, 400, 0);
        lineGradient.addColorStop(0, '#3b82f6');
        lineGradient.addColorStop(0.5, '#8b5cf6');
        lineGradient.addColorStop(1, '#f59e0b');

        this.lineChartData.datasets[0].backgroundColor = gradient;
        this.lineChartData.datasets[0].borderColor = lineGradient;
        this.chart.chart.update();
      }
    }, 100);
  }
  private authService = inject(AuthApiService);
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  showProfileAlert = true;

  userName = 'Member';
  greeting = 'Good morning';
  greetingIcon = 'fa-sun';
  greetingTheme = 'theme-morning';

  // Toggle States
  caloriesPeriod: 'week' | 'month' = 'week';
  strengthPeriod: '1M' | '3M' | '6M' | '1Y' = '1M';

  // Lift States
  selectedLift: string = 'Squat';
  liftOptions: DropdownOption[] = [
    { label: 'Squat', value: 'Squat' },
    { label: 'Deadlift', value: 'Deadlift' },
    { label: 'Bench Press', value: 'Bench Press' }
  ];
  
  liftDataMap: any = {
    'Squat': [80, 85, 90, 95, 100, 105],
    'Deadlift': [100, 105, 115, 120, 130, 140],
    'Bench Press': [60, 65, 70, 72.5, 75, 80]
  };

  dailyQuests = [
    { id: 1, title: 'Drink 3L of Water', completed: true, icon: 'fa-glass-water', color: '#0ea5e9' },
    { id: 2, title: 'Complete Workout', completed: false, icon: 'fa-dumbbell', color: '#8b5cf6' },
    { id: 3, title: 'Stick to Diet Plan', completed: false, icon: 'fa-apple-whole', color: '#10b981' }
  ];

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [80, 85, 90, 95, 100, 105],
        label: 'Squat 1RM (kg)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#f59e0b',
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
        fill: 'origin',
        tension: 0.4,
        borderWidth: 3,
      }
    ],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.4 }
    },
    scales: {
      y: {
        grid: { color: 'rgba(15, 23, 42, 0.05)' },
        border: { display: false, dash: [4, 4] },
        ticks: { color: '#64748b', font: { family: 'Inter', weight: 500 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter', weight: 500 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 14, weight: 800, family: 'Inter' },
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      }
    }
  };

  public lineChartType: ChartType = 'line';

  ngOnInit() {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userName = profile.firstName || 'Member';
      }
    });

    this.setGreeting();
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good morning';
      this.greetingIcon = 'fa-sun';
      this.greetingTheme = 'theme-morning';
    } else if (hour < 18) {
      this.greeting = 'Good afternoon';
      this.greetingIcon = 'fa-cloud-sun';
      this.greetingTheme = 'theme-afternoon';
    } else {
      this.greeting = 'Good evening';
      this.greetingIcon = 'fa-moon';
      this.greetingTheme = 'theme-evening';
    }
  }

  toggleQuest(quest: any) {
    quest.completed = !quest.completed;
  }

  onLiftChange(lift: string) {
    this.selectedLift = lift;
    this.lineChartData.datasets[0].data = this.liftDataMap[lift];
    this.lineChartData.datasets[0].label = `${lift} 1RM (kg)`;
    if (this.chart) {
      this.chart.chart?.update();
    }
  }
}
