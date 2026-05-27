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
import { StaffService } from '../../../core/services/staff.service';
import { StaffAttendanceLogResponse } from '../../../core/models/staff.model';
import { AppGridConfig } from '../../../shared/constants/grid-config';
import { DataGrid, GridCellDirective } from '../../../shared/components/data-grid/data-grid.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DateTimePickerComponent, DataGrid, GridCellDirective],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})

export class AttendanceComponent implements OnInit {
  memberLogsGridConfig = AppGridConfig['MemberAttendanceLogs'];
  staffLogsGridConfig = AppGridConfig['StaffAttendanceLogs'];

  private branchContextService = inject(BranchContextService);
  private notification = inject(NotificationService);
  private memberService = inject(MemberService);
  private attendanceService = inject(AttendanceService);
  private staffService = inject(StaffService);
  private destroyRef = inject(DestroyRef);

  activeTab: 'terminal' | 'occupancy' | 'logs' | 'staff-terminal' = 'terminal';
  activeBranchName = 'All Branches';
  isSearching = false;
  isCheckingIn = false;
  isCheckingOut = false;
  isLoadingOccupancy = false;
  isLoadingLogs = false;

  // Staff Shift State
  staffSearchResults: any[] = [];
  isSearchingStaff = false;
  selectedStaff: any | null = null;
  staffSearchControl = new FormControl('');
  staffNotesControl = new FormControl('');
  currentlyCheckedInStaff: any[] = [];
  isLoadingStaffOccupancy = false;
  isStaffCheckingIn = false;
  isStaffCheckingOut = false;
  lastScannedStaff: any | null = null;
  staffScanTime: Date | null = null;
  staffVerificationState: 'idle' | 'selected' | 'success' | 'checkedout' = 'idle';

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
  logTypeFilter: 'member' | 'staff' = 'member';
  staffAttendanceLogs: StaffAttendanceLogResponse[] = [];
  filteredStaffLogs: StaffAttendanceLogResponse[] = [];
  memberPageNumber = 1;
  memberPageSize = 10;
  memberTotalItems = 0;
  staffPageNumber = 1;
  staffPageSize = 10;
  staffTotalItems = 0;

  // Logs filters
  logSearchControl = new FormControl('');
  logStatusFilter: 'all' | 'completed' | 'active' = 'all';
  dateFilterControl = new FormControl<Date | null>(new Date());

  readonly MemberStatus = MemberStatus;

  ngOnInit(): void {
    this.setupLiveSearch();
    this.setupLiveStaffSearch();

    this.branchContextService.activeBranch$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(branch => {
      this.activeBranchName = branch ? branch.name : 'All Branches';
      this.resetTerminal();
      this.resetStaffTerminal();
      this.loadOccupancy();
      this.loadLogs();
      this.loadStaffOccupancy();
    });

    this.logSearchControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(200)
    ).subscribe(() => this.applyLogFilters());
  }

  switchTab(tab: 'terminal' | 'occupancy' | 'logs' | 'staff-terminal'): void {
    this.activeTab = tab;
    if (tab === 'occupancy') this.loadOccupancy();
    if (tab === 'logs') this.loadLogs();
    if (tab === 'staff-terminal') this.loadStaffOccupancy();
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

  loadLogs(forceRefresh = false): void {
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

    if (this.logTypeFilter === 'staff') {
      this.staffService.getStaffAttendanceLogs({
        searchTerm: q || undefined,
        status: this.logStatusFilter !== 'all' ? this.logStatusFilter : undefined,
        date: dateStr,
        pageNumber: this.staffPageNumber,
        pageSize: this.staffPageSize
      }, forceRefresh).pipe(
        finalize(() => this.isLoadingLogs = false)
      ).subscribe({
        next: res => {
          let logs: any[] = [];
          let total = 0;
          
          if (res && res.data) {
            if (Array.isArray(res.data)) {
              logs = res.data;
              total = res.data.length;
            } else if (res.data.items && Array.isArray(res.data.items)) {
              logs = res.data.items;
              total = res.data.totalCount ?? res.data.items.length;
            }
          }
          
          logs.forEach((l: any) => {
            l.hoursWorkedLabel = l.checkOutTime ? (l.hoursWorked + ' hrs') : 'Active Shift';
          });
          
          this.staffAttendanceLogs = logs;
          this.staffTotalItems = total;
          this.applyLogFilters();
        },
        error: () => {
          this.notification.error('Failed to load staff shift logs.');
        }
      });
      return;
    }

    this.attendanceService.getLogs({
      searchTerm: q || undefined,
      status: this.logStatusFilter !== 'all' ? this.logStatusFilter : undefined,
      date: dateStr,
      pageNumber: this.memberPageNumber,
      pageSize: this.memberPageSize
    }, forceRefresh).pipe(
      finalize(() => this.isLoadingLogs = false)
    ).subscribe({
      next: res => {
        let logs: any[] = [];
        let total = 0;
        
        if (res && res.data) {
          if (Array.isArray(res.data)) {
            logs = res.data;
            total = res.data.length;
          } else if (res.data.items && Array.isArray(res.data.items)) {
            logs = res.data.items;
            total = res.data.totalCount ?? res.data.items.length;
          }
        }
        
        this.attendanceLogs = logs;
        this.memberTotalItems = total;
        this.applyLogFilters();
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

  setLogType(type: 'member' | 'staff'): void {
    this.logTypeFilter = type;
    this.loadLogs();
  }

  applyLogFilters(): void {
    const q = (this.logSearchControl.value || '').trim().toLowerCase();

    if (this.logTypeFilter === 'staff') {
      let sLogs = [...this.staffAttendanceLogs];

      if (q) {
        sLogs = sLogs.filter(l =>
          l.staffName.toLowerCase().includes(q) ||
          l.staffNumber.toLowerCase().includes(q) ||
          l.roleName.toLowerCase().includes(q)
        );
      }

      if (this.logStatusFilter === 'completed') {
        sLogs = sLogs.filter(l => l.checkOutTime != null);
      } else if (this.logStatusFilter === 'active') {
        sLogs = sLogs.filter(l => l.checkOutTime == null);
      }

      const selectedDateValue = this.dateFilterControl.value;
      if (selectedDateValue) {
        const selYear = selectedDateValue.getFullYear();
        const selMonth = selectedDateValue.getMonth();
        const selDay = selectedDateValue.getDate();
        sLogs = sLogs.filter(l => {
          if (!l.checkInTime) return false;
          const logDate = new Date(l.checkInTime);
          return logDate.getFullYear() === selYear &&
            logDate.getMonth() === selMonth &&
            logDate.getDate() === selDay;
        });
      }

      this.filteredStaffLogs = sLogs;
      return;
    }

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

  get totalPages(): number {
    const size = this.logTypeFilter === 'member' ? this.memberPageSize : this.staffPageSize;
    const total = this.logTypeFilter === 'member' ? this.memberTotalItems : this.staffTotalItems;
    return Math.max(Math.ceil(total / size), 1);
  }

  get currentPageNumber(): number {
    return this.logTypeFilter === 'member' ? this.memberPageNumber : this.staffPageNumber;
  }

  get currentTotalItems(): number {
    return this.logTypeFilter === 'member' ? this.memberTotalItems : this.staffTotalItems;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    if (this.logTypeFilter === 'member') {
      this.memberPageNumber = page;
    } else {
      this.staffPageNumber = page;
    }
    this.loadLogs();
  }

  onPageSizeChange(size: number): void {
    if (this.logTypeFilter === 'member') {
      this.memberPageSize = size;
      this.memberPageNumber = 1;
    } else {
      this.staffPageSize = size;
      this.staffPageNumber = 1;
    }
    this.loadLogs();
  }

  refreshLogs(): void {
    this.loadLogs(true);
  }

  nextPage(): void {
    this.goToPage(this.currentPageNumber + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPageNumber - 1);
  }

  getAttendancePercentage(): number {
    return Math.min(Math.round(this.occupancyStats.utilizationPercentage), 100);
  }

  private setupLiveStaffSearch(): void {
    this.staffSearchControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        const q = (query || '').trim();
        if (!q) {
          this.staffSearchResults = [];
          this.isSearchingStaff = false;
          return of(null);
        }
        this.isSearchingStaff = true;
        return this.staffService.getGymStaff(1, 10, q).pipe(
          catchError(() => {
            this.notification.error('Failed to search staff.');
            return of(null);
          })
        );
      })
    ).subscribe(response => {
      this.isSearchingStaff = false;
      this.staffSearchResults = response?.data?.items ?? [];
    });
  }

  loadStaffOccupancy(): void {
    this.isLoadingStaffOccupancy = true;
    this.staffService.getGymStaff(1, 100, '').pipe(
      finalize(() => this.isLoadingStaffOccupancy = false)
    ).subscribe({
      next: res => {
        const items = res.data?.items ?? [];
        this.currentlyCheckedInStaff = items.filter((s: any) => s.isCheckedIn).map((s: any) => ({
          ...s,
          fullName: `${s.firstName} ${s.lastName}`,
          roleName: this.staffService.getRoleName(s.role),
          initials: `${s.firstName.charAt(0)}${s.lastName.charAt(0)}`.toUpperCase()
        }));
      },
      error: () => this.notification.error('Failed to load on-duty staff.')
    });
  }

  selectStaffToCheckIn(staff: any): void {
    this.staffSearchControl.setValue('', { emitEvent: false });
    this.staffSearchResults = [];
    this.selectedStaff = {
      ...staff,
      fullName: `${staff.firstName} ${staff.lastName}`,
      roleName: this.staffService.getRoleName(staff.role),
      initials: `${staff.firstName.charAt(0)}${staff.lastName.charAt(0)}`.toUpperCase()
    };
    this.staffNotesControl.setValue('');
    this.staffVerificationState = 'selected';
  }

  confirmStaffCheckIn(): void {
    if (!this.selectedStaff || this.isStaffCheckingIn) return;
    this.isStaffCheckingIn = true;

    this.staffService.checkInStaff(this.selectedStaff.id, this.staffNotesControl.value || '').pipe(
      finalize(() => this.isStaffCheckingIn = false)
    ).subscribe({
      next: res => {
        this.lastScannedStaff = {
          ...res.data,
          fullName: `${res.data.firstName} ${res.data.lastName}`,
          roleName: this.staffService.getRoleName(res.data.role),
          initials: `${res.data.firstName.charAt(0)}${res.data.lastName.charAt(0)}`.toUpperCase()
        };
        this.staffScanTime = res.data.lastCheckInTime ? new Date(res.data.lastCheckInTime) : new Date();
        this.staffVerificationState = 'success';
        this.notification.success(`Access Granted: ${this.selectedStaff!.fullName}`);
        this.loadStaffOccupancy();
      },
      error: err => {
        this.notification.error(err?.error?.message || 'Shift Check-in failed.');
      }
    });
  }

  confirmStaffCheckOut(staffId?: string): void {
    const id = staffId || this.selectedStaff?.id;
    if (!id || this.isStaffCheckingOut) return;
    this.isStaffCheckingOut = true;

    const staffName = staffId ? 'Staff' : this.selectedStaff?.fullName;

    this.staffService.checkOutStaff(id).pipe(
      finalize(() => this.isStaffCheckingOut = false)
    ).subscribe({
      next: res => {
        this.lastScannedStaff = {
          ...res.data,
          fullName: `${res.data.firstName} ${res.data.lastName}`,
          roleName: this.staffService.getRoleName(res.data.role),
          initials: `${res.data.firstName.charAt(0)}${res.data.lastName.charAt(0)}`.toUpperCase()
        };
        this.staffScanTime = new Date();
        this.staffVerificationState = 'checkedout';
        this.notification.success(`${staffName} checked out successfully.`);
        this.loadStaffOccupancy();
      },
      error: err => {
        this.notification.error(err?.error?.message || 'Shift Check-out failed.');
      }
    });
  }

  resetStaffTerminal(): void {
    this.staffVerificationState = 'idle';
    this.lastScannedStaff = null;
    this.selectedStaff = null;
    this.staffScanTime = null;
    this.staffSearchControl.setValue('', { emitEvent: false });
    this.staffSearchResults = [];
    this.isSearchingStaff = false;
    this.isStaffCheckingIn = false;
    this.isStaffCheckingOut = false;
    this.staffNotesControl.setValue('');
  }
}
