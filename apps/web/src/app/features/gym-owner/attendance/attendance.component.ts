import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MemberService } from '../../../core/services/member.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { GymMember, MemberStatus } from '../../../shared/models/member.model';
import { AttendanceLogResponse, CheckedInMemberResponse, OccupancyStatsResponse, SearchableMember } from '../../../shared/models/attendance.model';
import { DateTimePickerComponent } from '../../../shared/components/date-time-picker/date-time-picker.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DateTimePickerComponent],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})

export class AttendanceComponent implements OnInit {

  private branchContextService = inject(BranchContextService);
  private notification = inject(NotificationService);
  private memberService = inject(MemberService);
  private attendanceService = inject(AttendanceService);
  private destroyRef = inject(DestroyRef);

  activeTab: 'terminal' | 'occupancy' | 'logs' = 'terminal';
  activeBranchName = 'All Branches';
  isSearching = false;
  isCheckingIn = false;
  isCheckingOut = false;
  isLoadingOccupancy = false;
  isLoadingLogs = false;

  // Verification Screen States
  verificationState: 'idle' | 'selected' | 'success' | 'expired' | 'frozen' | 'checkedout' = 'idle';
  lastScannedMember: SearchableMember | null = null;
  selectedMember: SearchableMember | null = null;
  scanTime: Date | null = null;

  // Search
  searchResults: SearchableMember[] = [];
  searchControl = new FormControl('');

  // Live occupancy
  currentlyCheckedIn: CheckedInMemberResponse[] = [];
  occupancyStats: OccupancyStatsResponse = { currentHeadcount: 0, safetyLimit: 80, utilizationPercentage: 0 };

  // Logs
  attendanceLogs: AttendanceLogResponse[] = [];
  filteredLogs: AttendanceLogResponse[] = [];

  // Logs filters
  logSearchControl = new FormControl('');
  logStatusFilter: 'all' | 'completed' | 'active' = 'all';
  dateFilterControl = new FormControl<Date | null>(new Date());

  readonly MemberStatus = MemberStatus;

  ngOnInit(): void {
    this.setupLiveSearch();

    this.branchContextService.activeBranch$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(branch => {
      this.activeBranchName = branch ? branch.name : 'All Branches';
      this.resetTerminal();
      this.loadOccupancy();
      this.loadLogs();
    });

    this.logSearchControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(200)
    ).subscribe(() => this.applyLogFilters());
  }

  switchTab(tab: 'terminal' | 'occupancy' | 'logs'): void {
    this.activeTab = tab;
    if (tab === 'occupancy') this.loadOccupancy();
    if (tab === 'logs') this.loadLogs();
  }

  loadOccupancy(): void {
    this.isLoadingOccupancy = true;
    this.attendanceService.getOccupancy().pipe(
      finalize(() => this.isLoadingOccupancy = false)
    ).subscribe({
      next: res => {
        if (res.success) {
          this.currentlyCheckedIn = res.data ?? [];
        }
      },
      error: () => this.notification.error('Failed to load occupancy data.')
    });

    this.attendanceService.getOccupancyStats().subscribe({
      next: res => {
        if (res.success) this.occupancyStats = res.data;
      }
    });
  }

  loadLogs(): void {
    this.isLoadingLogs = true;
    const q = (this.logSearchControl.value || '').trim();

    let dateStr: string | undefined;
    const selectedDateValue = this.dateFilterControl.value;
    if (selectedDateValue) {
      const d = selectedDateValue;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }

    this.attendanceService.getLogs({
      searchTerm: q || undefined,
      status: this.logStatusFilter !== 'all' ? this.logStatusFilter : undefined,
      date: dateStr,
      pageNumber: 1,
      pageSize: 100
    }).pipe(
      finalize(() => this.isLoadingLogs = false)
    ).subscribe({
      next: res => {
        if (res.success) {
          this.attendanceLogs = res.data?.items ?? [];
          this.applyLogFilters();
        }
      },
      error: () => this.notification.error('Failed to load attendance logs.')
    });
  }

  private setupLiveSearch(): void {
    this.searchControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        const q = (query || '').trim();
        if (!q) {
          this.searchResults = [];
          this.isSearching = false;
          return of(null);
        }
        this.isSearching = true;
        return this.memberService.getGymMembers(1, 10, q).pipe(
          catchError(() => {
            this.notification.error('Failed to search members.');
            return of(null);
          })
        );
      })
    ).subscribe(response => {
      this.isSearching = false;
      this.searchResults = response?.data?.items?.map(m => this.mapToSearchable(m)) ?? [];
    });
  }

  private mapToSearchable(m: GymMember): SearchableMember {
    const initials = `${m.firstName.charAt(0)}${m.lastName.charAt(0)}`.toUpperCase();
    return {
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      membershipNumber: m.membershipNumber,
      email: m.email,
      status: m.status,
      statusLabel: this.getStatusLabel(m.status),
      planName: m.currentSubscription?.planNameSnapshot ?? 'No Active Plan',
      expiryDate: m.currentSubscription?.endDate ?? '',
      initials
    };
  }

  private getStatusLabel(status: MemberStatus): string {
    switch (status) {
      case MemberStatus.Active: return 'Active';
      case MemberStatus.Freeze: return 'Frozen';
      case MemberStatus.Expired: return 'Expired';
      case MemberStatus.Inactive: return 'Inactive';
      case MemberStatus.Pending: return 'Pending';
      default: return 'Unknown';
    }
  }

  selectMemberToCheckIn(member: SearchableMember): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.searchResults = [];
    this.selectedMember = member;
    this.verificationState = 'selected';
  }

  isAlreadyCheckedIn(memberId: string): boolean {
    return this.currentlyCheckedIn.some(c => c.memberId === memberId);
  }

  getCheckedInRecord(memberId: string): CheckedInMemberResponse | undefined {
    return this.currentlyCheckedIn.find(c => c.memberId === memberId);
  }

  confirmCheckIn(): void {
    if (!this.selectedMember || this.isCheckingIn) return;
    this.isCheckingIn = true;

    this.attendanceService.checkIn({
      memberId: this.selectedMember.id,
      method: 'Manual'
    }).pipe(
      finalize(() => this.isCheckingIn = false)
    ).subscribe({
      next: res => {
        if (res.success) {
          this.lastScannedMember = this.selectedMember;
          this.scanTime = res.data?.checkInTime ? new Date(res.data.checkInTime) : new Date();
          this.verificationState = 'success';
          this.notification.success(`Access Granted: ${this.selectedMember!.name}`);
          this.loadOccupancy();
        }
      },
      error: err => {
        const msg = err?.error?.message || 'Check-in failed.';
        if (msg.toLowerCase().includes('expired')) {
          this.verificationState = 'expired';
        } else if (msg.toLowerCase().includes('frozen')) {
          this.verificationState = 'frozen';
        } else {
          this.verificationState = 'expired';
        }
        this.lastScannedMember = this.selectedMember;
        this.scanTime = new Date();
        this.notification.error(msg);
      }
    });
  }

  confirmCheckOut(): void {
    if (!this.selectedMember || this.isCheckingOut) return;
    this.isCheckingOut = true;

    this.attendanceService.checkOut({ memberId: this.selectedMember.id }).pipe(
      finalize(() => this.isCheckingOut = false)
    ).subscribe({
      next: res => {
        if (res.success) {
          this.lastScannedMember = this.selectedMember;
          this.scanTime = res.data?.checkOutTime ? new Date(res.data.checkOutTime) : new Date();
          this.verificationState = 'checkedout';
          this.notification.success(`${this.selectedMember!.name} checked out successfully.`);
          this.loadOccupancy();
          this.logStatusFilter = 'all';
          this.loadLogs();
        }
      },
      error: err => {
        this.notification.error(err?.error?.message || 'Check-out failed.');
      }
    });
  }

  checkOutFromOccupancy(item: CheckedInMemberResponse): void {
    this.isCheckingOut = true;
    this.attendanceService.checkOut({ memberId: item.memberId }).pipe(
      finalize(() => this.isCheckingOut = false)
    ).subscribe({
      next: res => {
        if (res.success) {
          this.notification.success(`${item.name} checked out successfully.`);
          this.loadOccupancy();
          this.logStatusFilter = 'all';
          this.loadLogs();
        }
      },
      error: err => {
        this.notification.error(err?.error?.message || 'Check-out failed.');
      }
    });
  }

  resetTerminal(): void {
    this.verificationState = 'idle';
    this.lastScannedMember = null;
    this.selectedMember = null;
    this.scanTime = null;
    this.searchControl.setValue('', { emitEvent: false });
    this.searchResults = [];
    this.isSearching = false;
    this.isCheckingIn = false;
    this.isCheckingOut = false;
  }

  setLogStatus(status: 'all' | 'completed' | 'active'): void {
    this.logStatusFilter = status;
    this.loadLogs();
  }

  applyLogFilters(): void {
    const q = (this.logSearchControl.value || '').trim().toLowerCase();
    let logs = [...this.attendanceLogs];

    if (q) {
      logs = logs.filter(l =>
        l.memberName.toLowerCase().includes(q) ||
        l.membershipNumber.toLowerCase().includes(q)
      );
    }

    if (this.logStatusFilter === 'completed') {
      logs = logs.filter(l => l.status.toLowerCase() === 'completed');
    } else if (this.logStatusFilter === 'active') {
      logs = logs.filter(l => l.status.toLowerCase() === 'active');
    }

    const selectedDateValue = this.dateFilterControl.value;
    if (selectedDateValue) {
      const selYear = selectedDateValue.getFullYear();
      const selMonth = selectedDateValue.getMonth();
      const selDay = selectedDateValue.getDate();
      logs = logs.filter(l => {
        if (!l.checkInTime) return false;
        const logDate = new Date(l.checkInTime);
        return logDate.getFullYear() === selYear &&
          logDate.getMonth() === selMonth &&
          logDate.getDate() === selDay;
      });
    }

    this.filteredLogs = logs;
  }

  getAttendancePercentage(): number {
    return Math.min(Math.round(this.occupancyStats.utilizationPercentage), 100);
  }
}
