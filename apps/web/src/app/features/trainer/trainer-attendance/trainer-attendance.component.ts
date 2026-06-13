import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { StaffService } from '../../../core/services/staff.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StaffResponse } from '../../../core/models/staff.model';
import { Subscription, interval } from 'rxjs';
import { DataGrid, GridCellDirective } from '../../../shared/components/data-grid/data-grid.component';
import { GridConfigDef } from '../../../shared/models/grid-config.model';

@Component({
  selector: 'app-trainer-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGrid, GridCellDirective],
  templateUrl: './trainer-attendance.component.html',
  styleUrl: './trainer-attendance.component.scss'
})
export class TrainerAttendanceComponent implements OnInit, OnDestroy {
  private authService = inject(AuthApiService);
  private staffService = inject(StaffService);
  private notification = inject(NotificationService);

  userId = '';
  staffDetails: StaffResponse | null = null;
  isCheckedIn = false;
  checkInNotes = '';
  loading = false;
  timerString = '00:00:00';
  private timerSubscription: Subscription | null = null;

  gridConfig: GridConfigDef = {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'checkInTime', label: 'Clock In' },
      { key: 'checkOutTime', label: 'Clock Out' },
      { key: 'hoursWorked', label: 'Hours Logged' },
      { key: 'notes', label: 'Notes' }
    ]
  };

  // History logs pagination
  logs: any[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalLogsCount = 0;
  totalPages = 1;
  loadingLogs = false;

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userId = profile.id;
        this.loadStaffStatus();
        this.loadAttendanceLogs();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  loadStaffStatus(): void {
    this.loading = true;
    this.staffService.getStaffById(this.userId).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.data) {
          this.staffDetails = res.data;
          this.isCheckedIn = res.data.isCheckedIn;
          if (this.isCheckedIn && res.data.lastCheckInTime) {
            this.startTimer(new Date(res.data.lastCheckInTime));
          } else {
            this.stopTimer();
          }
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading staff status:', err);
      }
    });
  }

  loadAttendanceLogs(): void {
    this.loadingLogs = true;
    const params = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };
    this.staffService.getStaffAttendanceLogs(params).subscribe({
      next: (res: any) => {
        this.loadingLogs = false;
        if (res?.data) {
          this.logs = res.data.items || [];
          this.totalLogsCount = res.data.totalCount || 0;
          this.totalPages = Math.ceil(this.totalLogsCount / this.pageSize) || 1;
        }
      },
      error: (err) => {
        this.loadingLogs = false;
        console.error('Error loading attendance logs:', err);
      }
    });
  }

  toggleClock(): void {
    if (this.isCheckedIn) {
      this.clockOut();
    } else {
      this.clockIn();
    }
  }

  clockIn(): void {
    this.loading = true;
    this.staffService.checkInStaff(this.userId, this.checkInNotes).subscribe({
      next: (res: any) => {
        this.notification.success('Successfully clocked in!');
        this.checkInNotes = '';
        this.loadStaffStatus();
        this.loadAttendanceLogs();
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(err?.error?.message || 'Failed to clock in');
      }
    });
  }

  clockOut(): void {
    this.loading = true;
    this.staffService.checkOutStaff(this.userId).subscribe({
      next: (res: any) => {
        this.notification.success('Successfully clocked out!');
        this.loadStaffStatus();
        this.loadAttendanceLogs();
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(err?.error?.message || 'Failed to clock out');
      }
    });
  }

  startTimer(checkInTime: Date): void {
    this.stopTimer();
    this.timerSubscription = interval(1000).subscribe(() => {
      const now = new Date();
      const diffMs = now.getTime() - checkInTime.getTime();
      if (diffMs < 0) {
        this.timerString = '00:00:00';
        return;
      }
      const diffSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;
      this.timerString = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    this.timerString = '00:00:00';
  }

  padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadAttendanceLogs();
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.pageNumber = 1;
    this.loadAttendanceLogs();
  }
}
