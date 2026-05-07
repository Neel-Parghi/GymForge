import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { RouterLink } from "@angular/router";
import { CONSTANTS } from '../../../core/constants/constants';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats: any = {
    platformHealth: { status: CONSTANTS.DASHBOARD.LOADING, lastCheck: '...' },
    totalRevenue: { value: '₹0', trend: '0%', isPositive: true, subtext: CONSTANTS.DASHBOARD.METRIC_SUBTEXTS.TOTAL_REVENUE },
    monthlyRecurringRevenue: { value: '₹0', trend: '0%', isPositive: true, subtext: CONSTANTS.DASHBOARD.MRR_SUBTEXT },
    annualRecurringRevenue: { value: '₹0', trend: '0%', isPositive: true, subtext: CONSTANTS.DASHBOARD.ARR_SUBTEXT },
    subscriptions: { value: '0', trend: '0%', isPositive: true, subtext: CONSTANTS.DASHBOARD.METRIC_SUBTEXTS.SUBSCRIPTIONS, progress: 0 },
    totalGyms: { value: '0', trend: 'Growth', isPositive: true, subtext: CONSTANTS.DASHBOARD.METRIC_SUBTEXTS.TOTAL_GYMS }
  };
  planDistribution: any[] = [];

  recentRegistrations: any[] = [];
  showReportModal = false;
  isDownloading = false;

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.dashboardService.getStats().subscribe({
      next: (res: any) => {
        const data = res.data;
        if (data) {
          this.stats = {
            platformHealth: data.health,
            totalRevenue: this.processMetric(data.totalRevenue, 'currency'),
            monthlyRecurringRevenue: this.processMetric(data.monthlyRecurringRevenue, 'currency'),
            annualRecurringRevenue: this.processMetric(data.annualRecurringRevenue, 'currency'),
            subscriptions: this.processMetric(data.subscriptions, 'number'),
            totalGyms: this.processMetric(data.totalGyms, 'number')
          };

          // Custom subtexts for the frontend
          this.stats.totalRevenue.subtext = CONSTANTS.DASHBOARD.METRIC_SUBTEXTS.TOTAL_REVENUE;
          this.stats.monthlyRecurringRevenue.subtext = CONSTANTS.DASHBOARD.MRR_SUBTEXT;
          this.stats.annualRecurringRevenue.subtext = CONSTANTS.DASHBOARD.ARR_SUBTEXT;
          this.stats.subscriptions.subtext = CONSTANTS.DASHBOARD.METRIC_SUBTEXTS.SUBSCRIPTIONS;
          this.stats.totalGyms.subtext = CONSTANTS.DASHBOARD.METRIC_SUBTEXTS.TOTAL_GYMS;

          this.planDistribution = data.planDistribution || [];
          this.recentRegistrations = data.recentRegistrations || [];
        }
      }
    });
  }

  openReportModal() {
    this.showReportModal = true;
  }

  closeReportModal() {
    this.showReportModal = false;
  }

  downloadReport(type: string) {
    this.isDownloading = true;

    this.dashboardService.downloadReport(type).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${CONSTANTS.DASHBOARD.REPORT_FILENAME_PREFIX}_${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.isDownloading = false;
        this.closeReportModal();
      },
      error: (err) => {
        console.error('Download failed', err);
        this.isDownloading = false;
      }
    });
  }

  private processMetric(metric: any, type: 'currency' | 'number') {
    if (!metric) return { value: type === 'currency' ? '₹0' : '0', trend: '0%', isPositive: true, progress: 0 };
    const current = metric.currentValue || 0;
    const previous = metric.previousValue || 0;

    let trend = 0;
    if (previous > 0) {
      trend = ((current - previous) / previous) * 100;
    }

    return {
      value: type === 'currency' ? this.formatCurrency(current) : current.toString(),
      trend: (trend >= 0 ? '+' : '') + trend.toFixed(1) + '%',
      isPositive: trend >= 0,
      progress: metric.progress || 0
    };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat(CONSTANTS.DASHBOARD.LOCALE, {
      style: 'currency',
      currency: CONSTANTS.DASHBOARD.CURRENCY,
      maximumFractionDigits: 0
    }).format(value);
  }

  getSparklinePoints(data: number[] | undefined): string {
    if (!data || data.length === 0) return CONSTANTS.DASHBOARD.SPARKLINE.DEFAULT_POINTS;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    return data.map((d, i) =>
      `${(i / (data.length - 1)) * 100},${CONSTANTS.DASHBOARD.SPARKLINE.HEIGHT} - ((d - min) / range) * ${CONSTANTS.DASHBOARD.SPARKLINE.RANGE_OFFSET}`
    ).join(' ');
  }
}
