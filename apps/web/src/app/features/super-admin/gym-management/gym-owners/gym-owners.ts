import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { AppGridConfig } from '../../../../shared/constants/grid-config';

@Component({
  selector: 'app-gym-owners',
  standalone: true,
  imports: [CommonModule, DataGrid],
  templateUrl: './gym-owners.html',
  styleUrl: './gym-owners.scss',
})
export class GymOwners {
  gridConfig = AppGridConfig['GymOwners'];

  data = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: true },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: false },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', status: true },
  ];

  selectedOwners: any[] = [];

  handleAction(event: { action: string, row: any }) {
    console.log('Action triggered:', event.action, 'on row:', event.row);
  }

  onSelectionChange(selected: any[]) {
    this.selectedOwners = selected;
  }
}
