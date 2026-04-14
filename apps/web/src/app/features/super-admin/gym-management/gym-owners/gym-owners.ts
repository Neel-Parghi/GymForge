import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { AddOwnerModalComponent } from '../components/add-owner-modal/add-owner-modal.component';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { GymService } from '../../../../core/services/gym.service';
import { ApiResponse } from '../../../../shared/models/api-response.model';

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
  private gymService = inject(GymService);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    this.getGymOwners();
  }

  getGymOwners() {
    this.gymService.getGymOwners().subscribe({
      next: (res: ApiResponse) => {
        this.data = res.Data;
        console.log(this.data)
      },
      error: (err: any) => {
        this.notification.error(err.error?.message || 'Failed to load owners');
      }
    });
  }

  handleAction(event: { action: string, row: any }) {
    if (event.action === 're-invite') {
      this.reInvite(event.row.id);
    }
    console.log('Action triggered:', event.action, 'on row:', event.row);
  }

  reInvite(ownerId: string) {
    this.userService.reInviteOwner(ownerId).subscribe({
      next: () => {
        this.notification.success('Re-invitation sent successfully!');
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Failed to re-invite owner');
      }
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
    this.getGymOwners();
  }
}
