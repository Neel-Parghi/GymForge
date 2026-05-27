import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffResponse } from '../../../../core/models/staff.model';
import { StaffService } from '../../../../core/services/staff.service';
import { MemberService } from '../../../../core/services/member.service';
import { SlideDrawerComponent } from '../../../../shared/components/slide-drawer/slide-drawer.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../shared/models/dropdown.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-staff-detail-drawer',
  standalone: true,
  imports: [CommonModule, SlideDrawerComponent, ReactiveFormsModule, DropdownComponent],
  templateUrl: './staff-detail-drawer.component.html',
  styleUrl: './staff-detail-drawer.component.scss'
})
export class StaffDetailDrawerComponent {
  private staffService = inject(StaffService);
  private memberService = inject(MemberService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  @Input() isOpen = false;
  @Input() staff: StaffResponse | null = null;
  @Input() branches: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<StaffResponse>();
  @Output() statusChanged = new EventEmitter<void>();

  activeTab: 'details' | 'members' | 'shifts' = 'details';
  assignedMembers: any[] = [];
  isLoadingMembers = false;
  staffShifts: any[] = [];
  isLoadingShifts = false;

  members: any[] = [];
  isLoadingMembersList = false;
  isAssignFormOpen = false;
  memberSelectControl = new FormControl('', Validators.required);
  preferredSlotControl = new FormControl('');
  durationControl = new FormControl('0', Validators.required);
  isSubmittingAssignment = false;
  isSubmittingShift = false;

  get initials(): string {
    if (!this.staff) return '';
    return `${this.staff.firstName[0]}${this.staff.lastName[0]}`.toUpperCase();
  }

  get statusClass(): string {
    return this.staff?.isActive ? 'active' : 'inactive';
  }

  get isTrainer(): boolean {
    return this.staff?.role === 1 || this.staff?.role === 5 || this.staff?.role === 6;
  }

  get memberOptions(): DropdownOption[] {
    return this.members.map(m => ({
      label: `${m.firstName} ${m.lastName} (${m.membershipNumber})`,
      value: m.id
    }));
  }

  readonly durationOptions: DropdownOption[] = [
    { label: '1 Month (30 Days)', value: '30' },
    { label: '3 Months (90 Days)', value: '90' },
    { label: '6 Months (180 Days)', value: '180' },
    { label: '1 Year (365 Days)', value: '365' }
  ];

  onClose() {
    this.activeTab = 'details';
    this.closeAssignForm();
    this.close.emit();
  }

  setActiveTab(tab: 'details' | 'members' | 'shifts') {
    this.activeTab = tab;
    this.closeAssignForm();
    if (tab === 'members') {
      this.loadMembers();
    } else if (tab === 'shifts') {
      this.loadStaffShifts();
    }
  }

  loadStaffShifts() {
    if (!this.staff) return;
    this.isLoadingShifts = true;
    this.staffService.getStaffAttendanceLogs({ bypassPagination: true }).subscribe({
      next: (res) => {
        const logs = res.data || [];
        this.staffShifts = logs.filter((l: any) => l.staffId === this.staff!.id);
        this.isLoadingShifts = false;
      },
      error: () => {
        this.isLoadingShifts = false;
      }
    });
  }

  loadMembers() {
    if (!this.staff) return;
    this.isLoadingMembers = true;
    this.staffService.getAssignedMembers(this.staff.id).subscribe({
      next: (res) => {
        this.assignedMembers = res.data || [];
        this.isLoadingMembers = false;
      },
      error: () => {
        this.isLoadingMembers = false;
      }
    });
  }

  loadMembersList() {
    this.isLoadingMembersList = true;
    this.memberService.getGymMembers(1, 100).subscribe({
      next: (res) => {
        this.members = res.data?.items || [];
        this.isLoadingMembersList = false;
      },
      error: () => {
        this.isLoadingMembersList = false;
      }
    });
  }

  openAssignForm() {
    this.isAssignFormOpen = true;
    if (this.members.length === 0) {
      this.loadMembersList();
    }
  }

  closeAssignForm() {
    this.isAssignFormOpen = false;
    this.memberSelectControl.setValue('');
    this.preferredSlotControl.setValue('');
    this.durationControl.setValue('0');
  }

  submitAssignment() {
    if (!this.staff || this.memberSelectControl.invalid) return;
    this.isSubmittingAssignment = true;
    const durationDays = parseInt(this.durationControl.value || '0', 10);
    const passDuration = durationDays > 0 ? durationDays : undefined;
    const selectedMemberId = this.memberSelectControl.value!;

    this.staffService.assignTrainerToMember(
      this.staff.id,
      selectedMemberId,
      this.preferredSlotControl.value || '',
      passDuration
    ).subscribe({
      next: () => {
        this.notification.success('Member assigned to trainer successfully!');
        this.isSubmittingAssignment = false;
        this.closeAssignForm();
        this.loadMembers();

        this.confirmationService.confirm({
          title: 'Generate PT Invoice?',
          message: 'Member assigned successfully! Would you like to generate a billing invoice for this training contract now?',
          confirmText: 'Yes, Create Invoice',
          cancelText: 'Maybe Later',
          type: 'info'
        }).then(confirmed => {
          if (confirmed) {
            this.close.emit();
            this.router.navigate(['/gym-owner/billing'], {
              queryParams: {
                createInvoice: 'true',
                memberId: selectedMemberId,
                reason: 'PT',
                duration: durationDays > 0 ? `${durationDays}_days` : 'ongoing'
              }
            });
          }
        });
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Failed to assign member.');
        this.isSubmittingAssignment = false;
      }
    });
  }

  deallocateMember(memberId: string) {
    if (!this.staff) return;
    this.confirmationService.confirm({
      title: 'End PT Assignment?',
      message: 'Are you sure you want to end this personal training assignment?',
      confirmText: 'End Assignment',
      cancelText: 'Cancel',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.staffService.deallocateTrainerFromMember(this.staff!.id, memberId).subscribe({
          next: () => {
            this.notification.success('Member deallocated successfully!');
            this.loadMembers();
          },
          error: (err) => {
            this.notification.error(err.error?.message || 'Failed to deallocate member.');
          }
        });
      }
    });
  }

  onEdit() {
    if (this.staff) {
      this.edit.emit(this.staff);
    }
  }

  getRoleName(role: number): string {
    return this.staffService.getRoleName(role);
  }

  toggleStatus() {
    if (!this.staff) return;

    this.notification.info('Status toggle functionality coming soon.');
  }

  checkInStaff() {
    if (!this.staff || this.isSubmittingShift) return;

    this.confirmationService.confirm({
      title: 'Trainer Shift Check-In',
      message: `Are you sure you want to Check-In ${this.staff.firstName} for their shift?`,
      confirmText: 'Check-In',
      cancelText: 'Cancel',
      type: 'info'
    }).then(confirmed => {
      if (confirmed) {
        this.isSubmittingShift = true;
        this.staffService.checkInStaff(this.staff!.id).subscribe({
          next: (res) => {
            this.notification.success(`${this.staff!.firstName} is now On-Duty!`);
            this.staff = res.data;
            this.isSubmittingShift = false;
          },
          error: (err) => {
            this.notification.error(err.error?.message || 'Check-in failed.');
            this.isSubmittingShift = false;
          }
        });
      }
    });
  }

  checkOutStaff() {
    if (!this.staff || this.isSubmittingShift) return;

    this.confirmationService.confirm({
      title: 'Trainer Shift Check-Out',
      message: `Are you sure you want to Check-Out ${this.staff.firstName} and end their shift?`,
      confirmText: 'Check-Out',
      cancelText: 'Cancel',
      type: 'warning'
    }).then(confirmed => {
      if (confirmed) {
        this.isSubmittingShift = true;
        this.staffService.checkOutStaff(this.staff!.id).subscribe({
          next: (res) => {
            this.notification.success(`${this.staff!.firstName} is now Off-Duty.`);
            this.staff = res.data;
            this.isSubmittingShift = false;
          },
          error: (err) => {
            this.notification.error(err.error?.message || 'Check-out failed.');
            this.isSubmittingShift = false;
          }
        });
      }
    });
  }

  getBranchName(branchId?: string): string {
    if (!branchId) return 'No Branch (General)';
    const branch = this.branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Unknown Branch';
  }
}
