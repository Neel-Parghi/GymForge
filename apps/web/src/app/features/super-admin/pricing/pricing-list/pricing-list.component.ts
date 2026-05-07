import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid } from "../../../../shared/components/data-grid/data-grid.component";
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { PricingService } from '../../../../core/services/pricing.service';
import { AddPricing } from '../add-pricing/add-pricing.component';
import { FilterBarComponent, FilterConfig } from '../../../../shared/components/filter-bar/filter-bar.component';
import { PricingPlan } from '../../../../shared/models/pricing.model';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { PlanDetailsDrawerComponent } from '../plan-details-drawer/plan-details-drawer.component';
import { CONSTANTS } from '../../../../core/constants/constants';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-pricing-list',
  standalone: true,
  imports: [CommonModule, DataGrid, AddPricing, FilterBarComponent, PlanDetailsDrawerComponent],
  templateUrl: './pricing-list.component.html',
  styleUrl: './pricing-list.component.scss',
})
export class PricingList implements OnInit {

  // Data state
  originalData: PricingPlan[] = [];
  filteredData: PricingPlan[] = [];
  displayData: PricingPlan[] = [];

  // Drawer state
  isViewDrawerOpen = false;
  isEditMode = false;
  selectedPlan: PricingPlan | null = null;

  // Pagination state
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  // Filter configuration
  filterConfigs: FilterConfig[] = []; // Search only for now

  selectedPlans: PricingPlan[] = [];
  gridConfig = AppGridConfig['PricingList'];
  isAddPlanModalOpen: boolean = false;

  pricingService = inject(PricingService);
  notification = inject(NotificationService);
  confirmation = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans() {
    this.pricingService.getAllPlans().subscribe((res: ApiResponse<PricingPlan[]>) => {
      this.originalData = res?.data || [];
      this.applyFilters({ search: '' });
    });
  }

  applyFilters(filters: any) {
    this.currentPage = 1;
    let results = [...this.originalData];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(item =>
        item.name.toLowerCase().includes(s) ||
        (item.description && item.description.toLowerCase().includes(s))
      );
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

  onSelectionChange(selected: PricingPlan[]) {
    this.selectedPlans = selected;
  }

  handleAction(event: { action: string, row: PricingPlan }) {
    if (event.action === CONSTANTS.VIEW || event.action === CONSTANTS.EDIT || event.action === CONSTANTS.ROW_CLICK) {
      this.selectedPlan = event.row;
      this.isViewDrawerOpen = true;
      this.isEditMode = event.action === CONSTANTS.EDIT;
      return;
    }

    if (event.action === CONSTANTS.DELETE) {
      this.deletePlan(event.row.id);
    }
  }

  deletePlan(id: string) {
    this.confirmation.confirm({
      title: CONSTANTS.CONFIRMATIONS.DELETE_PLAN_TITLE,
      message: CONSTANTS.CONFIRMATIONS.DELETE_PLAN_MESSAGE,
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.pricingService.deletePlan(id).subscribe({
          next: (res: any) => {
            const data = res?.data || res;

            if (data?.Success === false || data?.success === false) {
              const message = (data?.Message || data?.message) === 'PLAN_IN_USE'
                ? CONSTANTS.PLAN_DELETE_VALIDATION_MESSAGE
                : (data?.Message || data?.message || CONSTANTS.PLAN_DELETE_ERROR_MESSAGE);

              this.notification.error(message);
              return;
            }

            this.notification.success(CONSTANTS.PLAN_DELETE_SUCCESS_MESSAGE);
            this.loadPlans();
          },
          error: (err) => {
            this.notification.error(err.error?.message || CONSTANTS.PLAN_DELETE_ERROR_MESSAGE);
          }
        });
      }
    });
  }

  onSavePlan(updatedPlan: PricingPlan) {
    this.pricingService.updatePlan(updatedPlan).subscribe({
      next: () => {
        this.notification.success(CONSTANTS.COMMON_UPDATE_SUCCESS_MESSAGE);
        this.loadPlans();
        this.isViewDrawerOpen = false;
      },
      error: (err) => {
        this.notification.error(err.error?.message || CONSTANTS.COMMON_UPDATE_ERROR_MESSAGE);
      }
    });
  }

  openAddPlanModal() {
    this.isAddPlanModalOpen = true;
  }

  closeAddPlanModal() {
    this.isAddPlanModalOpen = false;
  }

  onPlanAdded(res: ApiResponse<PricingPlan>) {
    this.notification.success(CONSTANTS.PLAN_CREATE_SUCCESS_MESSAGE);
    this.loadPlans();
  }
}
