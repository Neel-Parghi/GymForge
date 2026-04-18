import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid } from "../../../../shared/components/data-grid/data-grid";
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { PricingService } from '../../../../core/services/pricing.service';
import { AddPricing } from '../add-pricing/add-pricing';
import { FilterBarComponent, FilterConfig } from '../../../../shared/components/filter-bar/filter-bar.component';

@Component({
  selector: 'app-pricing-list',
  standalone: true,
  imports: [CommonModule, DataGrid, AddPricing, FilterBarComponent],
  templateUrl: './pricing-list.html',
  styleUrl: './pricing-list.scss',
})
export class PricingList implements OnInit {

  // Data state
  originalData: any[] = [];
  filteredData: any[] = [];
  displayData: any[] = [];

  // Pagination state
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  // Filter configuration
  filterConfigs: FilterConfig[] = []; // Search only for now

  selectedPlans: any[] = [];
  gridConfig = AppGridConfig['PricingList'];
  isAddPlanModalOpen: boolean = false;

  pricingService = inject(PricingService);

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans() {
    this.pricingService.getAllPlans().subscribe((res: any) => {
      this.originalData = res?.data || res?.Data || [];
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

  onSelectionChange(selected: any[]) {
    this.selectedPlans = selected;
  }

  handleAction($event: { action: string, row: any }) {
    console.log('Action triggered:', $event.action, 'on row:', $event.row);
  }

  openAddPlanModal() {
    this.isAddPlanModalOpen = true;
  }

  closeAddPlanModal() {
    this.isAddPlanModalOpen = false;
  }

  onPlanAdded(newPlan: any) {
    this.loadPlans();
  }
}
