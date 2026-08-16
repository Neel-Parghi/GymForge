import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffService } from '../../../core/services/staff.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataGrid, GridCellDirective } from '../../../shared/components/data-grid/data-grid.component';
import { AppGridConfig } from '../../../shared/constants/grid-config';

@Component({
  selector: 'app-trainer-members',
  standalone: true,
  imports: [CommonModule, DataGrid, GridCellDirective],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class PTMembersTrackComponent implements OnInit {
  private staffService = inject(StaffService);
  private authService = inject(AuthApiService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  assignedMembers: any[] = [];
  isLoading = true;
  trainerId = '';
  isOwnerContext = false;
  gridConfig = AppGridConfig['PTClients'];

  ngOnInit(): void {
    const routeTrainerId = this.route.snapshot.paramMap.get('trainerId');
    
    if (routeTrainerId) {
      this.trainerId = routeTrainerId;
      this.isOwnerContext = true;
      this.loadMembers();
    } else {
      this.authService.userProfile$.subscribe(profile => {
        if (profile) {
          this.trainerId = profile.id;
          this.loadMembers();
        }
      });
    }
  }

  loadMembers(forceRefresh = false): void {
    this.isLoading = true;
    this.staffService.getAssignedMembers(this.trainerId, forceRefresh).subscribe({
      next: (res: any) => {
        this.assignedMembers = res?.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  navigateToMemberDetail(memberId: string): void {
    // If we have a trainerId in the route, we are in the Gym Owner portal
    const routeTrainerId = this.route.snapshot.paramMap.get('trainerId');
    if (routeTrainerId) {
      this.router.navigate([`/gym-owner/trainers/${routeTrainerId}/members/${memberId}`]);
    } else {
      this.router.navigate([`/trainer/members/${memberId}`]);
    }
  }

  deallocateMember(member: any): void {
    this.confirmationService.confirm({
      title: 'Deallocate Client',
      message: `Are you sure you want to remove your training allocation for ${member.firstName} ${member.lastName}?`,
      confirmText: 'Deallocate',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.staffService.deallocateTrainerFromMember(this.trainerId, member.memberId).subscribe({
          next: () => {
            this.notification.success(`Successfully deallocated ${member.firstName}`);
            this.loadMembers();
          },
          error: (err) => {
            this.notification.error(err?.error?.message || 'Failed to deallocate member');
          }
        });
      }
    });
  }

  onGridAction(event: { action: string; row: any }): void {
    if (event.action === 'view') {
      this.navigateToMemberDetail(event.row.memberId);
    } else if (event.action === 'delete') {
      this.deallocateMember(event.row);
    }
  }

  goBackToStaff(): void {
    this.router.navigate(['/gym-owner/staff']);
  }
}
