import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { GymOnboardingModalComponent } from '../components/gym-onboarding-modal/gym-onboarding-modal';
import { FilterBarComponent, FilterConfig } from '../../../../shared/components/filter-bar/filter-bar.component';
import { GymService } from '../../../../core/services/gym.service';
import { GymListResponse } from '../../../../shared/models/gym.model';
import { finalize } from 'rxjs';

import { GymDetailsDrawerComponent } from '../components/gym-details-drawer/gym-details-drawer.component';
import { CONSTANTS } from '../../../../core/constants/constants';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-gym-list',
  standalone: true,
  imports: [CommonModule, DataGrid, GymOnboardingModalComponent, FilterBarComponent, GymDetailsDrawerComponent],
  templateUrl: './gym-list.html',
  styleUrl: './gym-list.scss',
})
export class GymList implements OnInit {
  private gymService = inject(GymService);
  private notification = inject(NotificationService);
  private confirmation = inject(ConfirmationService);

  gridConfig = AppGridConfig['GymList'];
  isAddGymModalOpen = false;

  // Drawer state
  isDetailsDrawerOpen = false;
  isEditMode: boolean = false;
  selectedGymDetail?: GymListResponse;

  // Data state
  originalData: GymListResponse[] = [];
  filteredData: GymListResponse[] = [];
  displayData: GymListResponse[] = [];
  isLoading = false;

  // Pagination state
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      key: 'isActive',
      label: 'Status',
      options: [
        { label: CONSTANTS.UI_LABELS.ACTIVE, value: 'true' },
        { label: CONSTANTS.UI_LABELS.INACTIVE, value: 'false' }
      ]
    }
  ];

  selectedGyms: any[] = [];

  ngOnInit(): void {
    this.loadGyms();
  }

  loadGyms() {
    this.isLoading = true;
    this.gymService.getGymList()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          this.originalData = res.data || [];
          this.applyFilters({ search: '' });
        },
        error: (err) => this.notification.error(err.error?.message || CONSTANTS.GYM_LOAD_ERROR_MESSAGE)
      });
  }

  updateGym(gym: GymListResponse) {
    this.gymService.updateGym(gym.id, gym).subscribe({
      next: () => {
        this.notification.success(CONSTANTS.GYM_UPDATE_SUCCESS_MESSAGE);
        this.loadGyms();
      },
      error: (err) => {
        this.notification.error(err.error?.message || CONSTANTS.GYM_UPDATE_ERROR_MESSAGE);
      }
    });
  }

  applyFilters(filters: any) {
    this.currentPage = 1;
    let results = [...this.originalData];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(item =>
        item.gymName.toLowerCase().includes(s) ||
        item.brandName.toLowerCase().includes(s)
      );
    }

    if (filters.status) {
      const isStatusActive = filters.status === 'true';
      results = results.filter(item => item.isActive === isStatusActive);
    }

    this.filteredData = results;
    this.totalItems = results.length;
    this.updateDisplayData();
  }

  updateDisplayData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayData = this.filteredData.slice(startIndex, endIndex);
  }

  onFilterChanged(filters: any) {
    this.applyFilters(filters);
  }

  onPageChanged(page: number) {
    this.currentPage = page;
    this.updateDisplayData();
  }

  onPageSizeChanged(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateDisplayData();
  }

  handleAction(event: { action: string, row: any }) {
    this.selectedGymDetail = event.row;

    if (event.action === CONSTANTS.VIEW || event.action === CONSTANTS.EDIT || event.action === CONSTANTS.ROW_CLICK) {
      this.openDrawer(event.row, event.action);
    }
    if (event.action == CONSTANTS.DELETE) {
      if (event.row.branchesCount > 0) {
        this.notification.error(CONSTANTS.GYM_DELETE_VALIDATION_MESSAGE);
        return;
      }
      this.handleDelete(event.row);
    }
  }

  async handleDelete(gym: GymListResponse) {
    const confirmed = await this.confirmation.confirm({
      title: CONSTANTS.CONFIRMATIONS.DELETE_GYM_TITLE,
      message: CONSTANTS.CONFIRMATIONS.DELETE_GYM_MESSAGE.replace('{name}', gym.gymName),
      confirmText: CONSTANTS.DELETE,
      type: 'danger'
    });

    if (confirmed) {
      this.gymService.deleteGym(gym.id).subscribe({
        next: (res: any) => {
          const data = res?.data || res;

          if (data?.Success === false || data?.success === false) {
            const message = (data?.Message || data?.message) === 'GYM_HAS_BRANCHES'
              ? CONSTANTS.GYM_DELETE_VALIDATION_MESSAGE
              : (data?.Message || data?.message || CONSTANTS.GYM_DELETE_ERROR_MESSAGE);

            this.notification.error(message);
            return;
          }

          this.notification.success(CONSTANTS.GYM_DELETE_SUCCESS_MESSAGE);
          this.loadGyms();
        },
        error: (err) => {
          this.notification.error(err.error?.message || CONSTANTS.GYM_DELETE_ERROR_MESSAGE);
        }
      });
    }
  }

  openDrawer(rowInfo: GymListResponse, action: string) {
    this.selectedGymDetail = rowInfo;
    this.isDetailsDrawerOpen = true;
    this.isEditMode = action === CONSTANTS.EDIT;
  }

  onSelectionChange(selected: any[]) {
    this.selectedGyms = selected;
  }

  openAddGymModal() {
    this.isAddGymModalOpen = true;
  }

  closeAddGymModal() {
    this.isAddGymModalOpen = false;
  }

  closeDetailDrawer() {
    this.isDetailsDrawerOpen = false;
    this.isEditMode = false;
    this.selectedGymDetail = undefined;
  }
}
