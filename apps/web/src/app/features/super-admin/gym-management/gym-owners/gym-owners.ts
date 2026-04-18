import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { AddOwnerModalComponent } from '../components/add-owner-modal/add-owner-modal.component';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { GymService } from '../../../../core/services/gym.service';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { GymOwnerResponse } from '../../../../shared/models/gym.model';
import { OwnerDetailsDrawerComponent } from '../components/owner-details-drawer/owner-details-drawer.component';
import { CONSTANTS } from '../../../../core/constants/constants';

@Component({
  selector: 'app-gym-owners',
  standalone: true,
  imports: [CommonModule, DataGrid, AddOwnerModalComponent, OwnerDetailsDrawerComponent],
  templateUrl: './gym-owners.html',
  styleUrl: './gym-owners.scss',
})
export class GymOwners implements OnInit {
  gridConfig = AppGridConfig['GymOwners'];
  isAddOwnerModalOpen = false;
  isViewDrawerOpen = false;
  isEditMode: boolean = false;

  data: GymOwnerResponse[] = [];
  selectedOwners: GymOwnerResponse[] = [];
  selectedContext: GymOwnerResponse | null = null;

  private userService = inject(UserService);
  private gymService = inject(GymService);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    this.getGymOwners();
  }

  getGymOwners() {
    this.gymService.getGymOwners().subscribe({
      next: (res: ApiResponse<GymOwnerResponse[]>) => {
        this.data = res.Data;
      },
      error: (err: any) => {
        this.notification.error(err.error?.message || CONSTANTS.GYM_OWNER_LOAD_ERROR_MESSAGE);
      }
    });
  }

  openDrawer(rowInfo: GymOwnerResponse, action: string) {
    this.selectedContext = rowInfo;
    this.isViewDrawerOpen = true;
    this.isEditMode = action === CONSTANTS.EDIT;
  }

  handleAction(event: { action: string, row: GymOwnerResponse }) {
    if (event.action === CONSTANTS.EDIT || event.action === CONSTANTS.VIEW || event.action === CONSTANTS.ROW_CLICK) {
      this.openDrawer(event.row, event.action);
      return;
    }
    if (event.action === CONSTANTS.RE_INVITE) {
      this.reInvite(event.row.id);
    }
    if (event.action === CONSTANTS.DELETE) {
      if (event.row.gymsOwned > 0) {
        this.notification.error(CONSTANTS.GYM_OWNER_DELETE_VALIDATION_MESSAGE);
        return;
      }
      this.deleteGymOwner(event.row.id);
    }
  }

  deleteGymOwner(ownerId: string) {
    this.gymService.deleteGymOwner(ownerId).subscribe({
      next: () => {
        this.notification.success(CONSTANTS.GYM_OWNER_DELETE_SUCCESS_MESSAGE);
        this.getGymOwners();
      },
      error: (err) => {
        this.notification.error(err.error?.message || CONSTANTS.GYM_OWNER_DELETE_ERROR_MESSAGE);
      }
    })
  }

  reInvite(ownerId: string) {
    this.userService.reInviteOwner(ownerId).subscribe({
      next: () => {
        this.notification.success(CONSTANTS.GYM_OWNER_RE_INVITE_SUCCESS_MESSAGE);
      },
      error: (err) => {
        this.notification.error(err.error?.message || CONSTANTS.GYM_OWNER_RE_INVITE_ERROR_MESSAGE);
      }
    });
  }

  onSelectionChange(selected: GymOwnerResponse[]) {
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
