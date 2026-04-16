import { Component, inject } from '@angular/core';
import { DataGrid } from "../../../../shared/components/data-grid/data-grid";
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { PricingService } from '../../../../core/services/pricing.service';
import { AddPricing } from '../add-pricing/add-pricing';

@Component({
  selector: 'app-pricing-list',
  imports: [DataGrid, AddPricing],
  templateUrl: './pricing-list.html',
  styleUrl: './pricing-list.scss',
})
export class PricingList {

  selectedPlans: any[] = [];
  data: any;
  gridConfig = AppGridConfig['PricingList'];
  isAddPlanModalOpen: any;

  pricingService = inject(PricingService);

  constructor() {
    this.loadPlans();
  }

  loadPlans() {
    this.pricingService.getAllPlans().subscribe((res: any) => {
      this.data = res?.data || res?.Data || [];
    });
  }

  onSelectionChange(selected: any[]) {
    this.selectedPlans = selected;
  }

  handleAction($event: { action: string, row: any }) {
    throw new Error('Method not implemented.');
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
