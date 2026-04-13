import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { AddOwnerModalComponent } from '../components/add-owner-modal/add-owner-modal.component';
import { UserService } from '../../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gym-owners',
  standalone: true,
  imports: [CommonModule, DataGrid, AddOwnerModalComponent],
  templateUrl: './gym-owners.html',
  styleUrl: './gym-owners.scss',
})
export class GymOwners implements OnInit {
  gridConfig = AppGridConfig['GymOwners'];
  isAddOwnerModalOpen = false;

  data: any[] = [];
  selectedOwners: any[] = [];

  private userService = inject(UserService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.loadOwners();
  }

  loadOwners() {
    this.data = [
      { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', gymsOwned: 2, status: true },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', gymsOwned: 1, status: false },
      { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '5556667777', gymsOwned: 0, status: true },
    ];
  }

  handleAction(event: { action: string, row: any }) {
    if (event.action === 're-invite') {
      this.reInvite(event.row.id);
    }
    console.log('Action triggered:', event.action, 'on row:', event.row);
  }

  reInvite(ownerId: string) {
    this.userService.reInviteOwner(ownerId).subscribe({
      next: () => this.toastr.success('Re-invitation sent successfully!'),
      error: (err) => this.toastr.error(err.error?.message || 'Failed to re-invite owner')
    });
  }

  onSelectionChange(selected: any[]) {
    this.selectedOwners = selected;
  }

  openAddOwnerModal() {
    this.isAddOwnerModalOpen = true;
  }

  closeAddOwnerModal() {
    this.isAddOwnerModalOpen = false;
  }

  onOwnerInvited() {
    this.loadOwners();
  }
}
