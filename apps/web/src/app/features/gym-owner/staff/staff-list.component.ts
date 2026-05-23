import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataGrid } from "../../../shared/components/data-grid/data-grid.component";
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StaffService } from '../../../core/services/staff.service';
import { StaffResponse } from '../../../core/models/staff.model';
import { AppGridConfig } from '../../../shared/constants/grid-config';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { OnboardStaffModalComponent } from './onboard-staff-modal/onboard-staff-modal.component';
import { StaffDetailDrawerComponent } from './staff-detail-drawer/staff-detail-drawer.component';
import { ConfirmationPopupComponent } from '../../../shared/components/confirmation-popup/confirmation-popup.component';
import { GymService } from '../../../core/services/gym.service';
import { CONSTANTS } from '../../../core/constants/constants';
import { DropdownComponent } from "../../../shared/components/dropdown/dropdown.component";
import { FilterBarComponent } from "../../../shared/components/filter-bar/filter-bar.component";

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, DataGrid, OnboardStaffModalComponent, StaffDetailDrawerComponent, ConfirmationPopupComponent, FormsModule, ReactiveFormsModule, DropdownComponent, FilterBarComponent],
  templateUrl: './staff-list.component.html',
  styleUrl: './staff-list.component.scss'
})
export class StaffListComponent implements OnInit {
  private staffService = inject(StaffService);
  private authService = inject(AuthApiService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private branchContextService = inject(BranchContextService);
  private gymService = inject(GymService);

  staff: StaffResponse[] = [];
  branches: any[] = [];
  isLoading = true;
  isAddStaffModalOpen = false;
  isEditMode = false;
  isDrawerOpen = false;
  isConfirmDeleteOpen = false;
  viewMode: 'list' | 'dashboard' = 'list';
  staffToDelete: StaffResponse | null = null;
  selectedStaff: StaffResponse | null = null;
  gridConfig = AppGridConfig['StaffList'];

  // Pagination & Filtering state
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  searchTerm = '';
  activeFilterRole: string = '';

  filterConfigs: any[] = [
    {
      key: 'role',
      label: 'Role',
      options: [
        { value: '', label: 'All Roles' },
        { value: '1', label: 'Trainer' },
        { value: '2', label: 'Receptionist' },
        { value: '3', label: 'Manager' },
        { value: '4', label: 'Cleaner' },
        { value: '5', label: 'Yoga Instructor' },
        { value: '6', label: 'Zumba Instructor' },
      ]
    }
  ];

  ngOnInit(): void {
    this.gymService.getMyBranches().subscribe({
      next: (res) => this.branches = res.data || [],
      error: () => {}
    });

    this.branchContextService.activeBranch$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadStaff(false);
    });
  }

  loadStaff(refresh = false): void {
    const gymId = this.authService.getGymId();
    if (!gymId) {
      this.notification.error(CONSTANTS.STAFF_MODULE.SESSION_ERROR);
      return;
    }

    this.isLoading = true;
    this.staffService.getGymStaff(this.currentPage, this.pageSize, this.searchTerm, refresh).subscribe({
      next: (res) => {
        const staffData = res.data.items || [];
        this.staff = staffData.map(s => ({
          ...s,
          fullName: `${s.firstName} ${s.lastName}`,
          roleName: this.staffService.getRoleName(s.role)
        }));

        // If we have a role filter active (from our local tabs or dropdown), we filter locally for now
        // OR we could implement role filtering in backend too. 
        // For now, let's assume the backend search handles name/email/staffNumber.
        this.applyLocalFilters();

        this.totalItems = res.data.totalCount;
        this.isLoading = false;
      },
      error: () => {
        this.notification.error(CONSTANTS.STAFF_MODULE.LOAD_ERROR);
        this.isLoading = false;
      }
    });
  }

  applyLocalFilters(): void {
    if (this.activeFilterRole && this.activeFilterRole !== 'all') {
      this.staff = this.staff.filter(s => {
        const role = s.role;
        const roleId = parseInt(this.activeFilterRole);
        if (!isNaN(roleId)) return role === roleId;

        if (this.activeFilterRole === 'trainer') return [1, 5, 6].includes(role);
        if (this.activeFilterRole === 'admin') return [2, 3].includes(role);
        if (this.activeFilterRole === 'support') return [4, 0].includes(role);
        return true;
      });
    }
  }

  onFilterChanged(filters: any): void {
    this.searchTerm = filters.search || '';
    this.activeFilterRole = filters.role || 'all';
    this.currentPage = 1;
    this.loadStaff();
  }

  onPageChanged(page: any) {
    console.log(page)
    this.currentPage = page;
    this.loadStaff();
  }

  onPageSizeChanged(size: any) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadStaff();
  }

  setFilter(filter: string): void {
    this.activeFilterRole = filter;
    this.currentPage = 1;
    this.loadStaff();
  }

  onAddStaff(): void {
    this.isEditMode = false;
    this.selectedStaff = null;
    this.isAddStaffModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddStaffModalOpen = false;
    this.isEditMode = false;
    this.selectedStaff = null;
  }

  onAction(event: { action: string, row: any }): void {
    if (event.action === CONSTANTS.ACTIONS.EDIT) {
      this.onEditStaff(event.row);
    } else if (event.action === CONSTANTS.ACTIONS.DELETE) {
      this.staffToDelete = event.row;
      this.isConfirmDeleteOpen = true;
    }
    else if (event.action === CONSTANTS.ACTIONS.VIEW || event.action === 'row-click') {
      this.onViewStaff(event.row);
    }
  }

  confirmDelete(): void {
    if (!this.staffToDelete) return;

    this.isLoading = true;
    this.staffService.deleteStaff(this.staffToDelete.id).subscribe({
      next: () => {
        this.notification.success(CONSTANTS.STAFF_MODULE.DELETE_SUCCESS);
        this.isConfirmDeleteOpen = false;
        this.staffToDelete = null;
        this.loadStaff(true);
      },
      error: (err) => {
        this.notification.error(err.error?.message || CONSTANTS.STAFF_MODULE.DELETE_ERROR);
        this.isLoading = false;
      }
    });
  }

  onEditStaff(staff: StaffResponse): void {
    this.selectedStaff = staff;
    this.isEditMode = true;
    this.isAddStaffModalOpen = true;
    this.isDrawerOpen = false;
  }

  onViewStaff(staff: StaffResponse): void {
    this.selectedStaff = staff;
    this.isDrawerOpen = true;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'dashboard' : 'list';
  }

  exportToCsv(): void {
    this.notification.info(CONSTANTS.STAFF_MODULE.EXPORT_INFO);
  }

  get totalCount(): number {
    return this.staff.length;
  }

  get activeCount(): number {
    return this.staff.filter(s => s.isActive).length;
  }

  get trainersCount(): number {
    return this.staff.filter(s => s.isActive && (s.role === 1 || s.role === 5 || s.role === 6)).length;
  }

  get inactiveCount(): number {
    return this.staff.filter(s => !s.isActive).length;
  }

  get totalStaffCount(): number {
    return this.staff.length;
  }

  get activeTrainersCount(): number {
    return this.staff.filter(s => s.isActive && (s.role === 1 || s.role === 5 || s.role === 6)).length;
  }

  get pendingInvitesCount(): number {
    return this.staff.filter(s => !s.isActive).length;
  }
}
