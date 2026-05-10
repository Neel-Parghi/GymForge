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
import { OnboardStaffModalComponent } from './onboard-staff-modal/onboard-staff-modal.component';
import { StaffDetailDrawerComponent } from './staff-detail-drawer/staff-detail-drawer.component';
import { ConfirmationPopupComponent } from '../../../shared/components/confirmation-popup/confirmation-popup.component';
import { CONSTANTS } from '../../../core/constants/constants';
import { DropdownComponent } from "../../../shared/components/dropdown/dropdown.component";

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, DataGrid, OnboardStaffModalComponent, StaffDetailDrawerComponent, ConfirmationPopupComponent, FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './staff-list.component.html',
  styleUrl: './staff-list.component.scss'
})
export class StaffListComponent implements OnInit {
  private staffService = inject(StaffService);
  private authService = inject(AuthApiService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  staff: StaffResponse[] = [];
  filteredStaff: StaffResponse[] = [];
  isLoading = true;
  isAddStaffModalOpen = false;
  isEditMode = false;
  isDrawerOpen = false;
  isConfirmDeleteOpen = false;
  viewMode: 'list' | 'dashboard' = 'list';
  staffToDelete: StaffResponse | null = null;
  selectedStaff: StaffResponse | null = null;
  gridConfig = AppGridConfig['StaffList'];

  searchControl = new FormControl('');
  activeFilter = 'all';
  pageSize = 10;
  currentPage = 1;

  filterTabs = [
    { label: 'All Staff', value: 'all' },
    { label: 'Trainers', value: 'trainer' },
    { label: 'Management', value: 'admin' },
    { label: 'Support', value: 'support' }
  ];

  roles = [
    { value: 0, label: 'All Roles' },
    { value: 1, label: 'Trainer' },
    { value: 2, label: 'Receptionist' },
    { value: 3, label: 'Manager' },
    { value: 4, label: 'Cleaner' },
    { value: 5, label: 'Yoga Instructor' },
    { value: 6, label: 'Zumba Instructor' },
  ];

  ngOnInit(): void {
    this.loadStaff();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.filterStaff();
    });
  }

  loadStaff(refresh = false): void {
    const gymId = this.authService.getGymId();
    if (!gymId) {
      this.notification.error(CONSTANTS.STAFF_MODULE.SESSION_ERROR);
      return;
    }

    this.isLoading = true;
    this.staffService.getGymStaff(refresh).subscribe({
      next: (res) => {
        this.staff = (res.data || []).map(s => ({
          ...s,
          fullName: `${s.firstName} ${s.lastName}`,
          roleName: this.staffService.getRoleName(s.role)
        }));
        this.filterStaff();
        this.isLoading = false;
      },
      error: () => {
        this.notification.error(CONSTANTS.STAFF_MODULE.LOAD_ERROR);
        this.isLoading = false;
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterStaff();
  }

  onRoleFilter(role: any): void {
    if (!role || role.value === 0) {
      this.activeFilter = 'all';
    } else {
      this.activeFilter = role.value.toString();
    }
    this.filterStaff();
  }

  onSearch(): void {
    this.filterStaff();
  }

  filterStaff(): void {
    let filtered = [...this.staff];

    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(s => {
        const role = s.role;
        const roleId = parseInt(this.activeFilter);
        if (!isNaN(roleId)) {
          return role === roleId;
        }

        if (this.activeFilter === 'trainer') {
          return [1, 5, 6].includes(role); // Trainer, Yoga, Zumba
        } else if (this.activeFilter === 'admin') {
          return [2, 3].includes(role); // Receptionist, Manager
        } else if (this.activeFilter === 'support') {
          return [4, 0].includes(role); // Cleaner, Other
        }
        return true;
      });
    }

    // Search Filtering
    const searchQuery = this.searchControl.value || '';
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.firstName.toLowerCase().includes(query) ||
        s.lastName.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.staffNumber.toLowerCase().includes(query)
      );
    }

    this.filteredStaff = filtered;
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
