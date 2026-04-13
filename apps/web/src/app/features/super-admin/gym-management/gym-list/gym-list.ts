import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { GymOnboardingModalComponent } from '../components/gym-onboarding-modal/gym-onboarding-modal';

@Component({
  selector: 'app-gym-list',
  standalone: true,
  imports: [CommonModule, DataGrid, GymOnboardingModalComponent],
  templateUrl: './gym-list.html',
  styleUrl: './gym-list.scss',
})
export class GymList {
  gridConfig = AppGridConfig['GymList'];
  isAddGymModalOpen = false;

  data = [
    { id: 'G-101', name: 'Iron Forged Fitness', location: 'New York, NY', members: 450, status: true },
    { id: 'G-102', name: 'Peak Performance', location: 'Austin, TX', members: 320, status: true },
    { id: 'G-103', name: 'Velocity Gym', location: 'Miami, FL', members: 180, status: false },
  ];

  selectedGyms: any[] = [];

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
