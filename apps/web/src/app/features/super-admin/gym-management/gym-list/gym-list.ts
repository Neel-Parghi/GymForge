import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { GymOnboardingModalComponent } from '../components/gym-onboarding-modal/gym-onboarding-modal';
import { FilterBarComponent, FilterConfig } from '../../../../shared/components/filter-bar/filter-bar.component';

@Component({
  selector: 'app-gym-list',
  standalone: true,
  imports: [CommonModule, DataGrid, GymOnboardingModalComponent, FilterBarComponent],
  templateUrl: './gym-list.html',
  styleUrl: './gym-list.scss',
})
export class GymList implements OnInit {
  gridConfig = AppGridConfig['GymList'];
  isAddGymModalOpen = false;

  // Data state
  originalData = [
    { id: 'G-101', name: 'Iron Forged Fitness', location: 'New York, NY', members: 450, status: true },
    { id: 'G-102', name: 'Peak Performance', location: 'Austin, TX', members: 320, status: true },
    { id: 'G-103', name: 'Velocity Gym', location: 'Miami, FL', members: 180, status: false },
    { id: 'G-104', name: 'Brooklyn Barbell', location: 'Brooklyn, NY', members: 210, status: true },
    { id: 'G-105', name: 'Zen Yoga & Weights', location: 'Chicago, IL', members: 150, status: true },
    { id: 'G-106', name: 'Powerhouse Express', location: 'Houston, TX', members: 400, status: true },
    { id: 'G-107', name: 'Midwest Muscle', location: 'Denver, CO', members: 275, status: false },
    { id: 'G-108', name: 'Oceanic Crossfit', location: 'Santa Monica, CA', members: 330, status: true },
    { id: 'G-109', name: 'Lone Star Fitness', location: 'Dallas, TX', members: 220, status: true },
    { id: 'G-110', name: 'High Altitude Gym', location: 'Aspen, CO', members: 95, status: true },
    { id: 'G-111', name: 'Capital City Fitness', location: 'Washington, DC', members: 500, status: true },
    { id: 'G-112', name: 'Sunshine Studio', location: 'Orlando, FL', members: 120, status: true },
  ];

  filteredData: any[] = [];
  displayData: any[] = [];

  // Pagination state
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' }
      ]
    }
  ];

  selectedGyms: any[] = [];

  ngOnInit(): void {
    this.applyFilters({ search: '' });
  }

  applyFilters(filters: any) {
    this.currentPage = 1;
    let results = [...this.originalData];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(s) || 
        item.location.toLowerCase().includes(s)
      );
    }

    if (filters.status) {
      const isStatusActive = filters.status === 'true';
      results = results.filter(item => item.status === isStatusActive);
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
    console.log('Action triggered:', event.action, 'on row:', event.row);
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
}
