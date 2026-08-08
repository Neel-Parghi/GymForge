import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffResponse } from '../../../../core/models/staff.model';
import { StaffService } from '../../../../core/services/staff.service';
import { MemberService } from '../../../../core/services/member.service';
import { SlideDrawerComponent } from '../../../../shared/components/slide-drawer/slide-drawer.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../shared/models/dropdown.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { CONSTANTS } from '../../../../core/constants/constants';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-staff-detail-drawer',
  standalone: true,
  imports: [CommonModule, SlideDrawerComponent, FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './staff-detail-drawer.component.html',
  styleUrl: './staff-detail-drawer.component.scss'
})
export class StaffDetailDrawerComponent {
  private staffService = inject(StaffService);
  private memberService = inject(MemberService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() branches: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<StaffResponse>();
  @Output() statusChanged = new EventEmitter<void>();

  private _staff: StaffResponse | null = null;

  @Input()
  set staff(val: StaffResponse | null) {
    this._staff = val;
    this.onStaffChanged();
  }

  get staff(): StaffResponse | null {
    return this._staff;
  }

  private onStaffChanged() {
    this.allAssignedMembers = [];
    this.assignedMembers = [];
    this.staffShifts = [];
    this.showPastAssignments = false;
    if (this.staff) {
      if (this.isTrainer) {
        this.loadMembers();
      }
      if (this.activeTab === 'shifts') {
        this.loadStaffShifts();
      }
    }
  }

  activeTab: 'details' | 'members' | 'shifts' = 'details';
  allAssignedMembers: any[] = [];
  assignedMembers: any[] = [];
  showPastAssignmentsControl = new FormControl(false);

  get showPastAssignments(): boolean {
    return this.showPastAssignmentsControl.value || false;
  }

  set showPastAssignments(value: boolean) {
    this.showPastAssignmentsControl.setValue(value);
  }

  isLoadingMembers = false;
  staffShifts: any[] = [];
  isLoadingShifts = false;

  get displayedMembers(): any[] {
    if (this.showPastAssignments) {
      return this.allAssignedMembers.filter((m: any) => m.status !== 'Active');
    }
    return this.assignedMembers;
  }

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
        const logs = (res.data as any) || [];
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
        this.allAssignedMembers = res.data || [];
        this.assignedMembers = this.allAssignedMembers.filter((m: any) => m.status === 'Active');
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
        this.notification.success(CONSTANTS.STAFF_MODULE.ASSIGN_MEMBER_SUCCESS);
        this.isSubmittingAssignment = false;
        this.closeAssignForm();
        this.loadMembers();

        this.confirmationService.confirm({
          title: CONSTANTS.STAFF_MODULE.GENERATE_INVOICE_CONFIRM_TITLE,
          message: CONSTANTS.STAFF_MODULE.GENERATE_INVOICE_CONFIRM_MSG,
          confirmText: CONSTANTS.STAFF_MODULE.GENERATE_INVOICE_CONFIRM_TEXT,
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
      title: CONSTANTS.STAFF_MODULE.END_PT_ASSIGNMENT_CONFIRM_TITLE,
      message: CONSTANTS.STAFF_MODULE.END_PT_ASSIGNMENT_CONFIRM_MSG,
      confirmText: CONSTANTS.STAFF_MODULE.END_PT_ASSIGNMENT_CONFIRM_TEXT,
      cancelText: 'Cancel',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.staffService.deallocateTrainerFromMember(this.staff!.id, memberId).subscribe({
          next: () => {
            this.notification.success(CONSTANTS.STAFF_MODULE.DEALLOCATE_MEMBER_SUCCESS);
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

    this.notification.info(CONSTANTS.STAFF_MODULE.STATUS_TOGGLE_INFO);
  }

  checkInStaff() {
    if (!this.staff || this.isSubmittingShift) return;

    this.confirmationService.confirm({
      title: CONSTANTS.STAFF_MODULE.SHIFT_CHECKIN_CONFIRM_TITLE,
      message: CONSTANTS.STAFF_MODULE.SHIFT_CHECKIN_CONFIRM_MSG.replace('{name}', this.staff.firstName),
      confirmText: 'Check-In',
      cancelText: 'Cancel',
      type: 'info'
    }).then(confirmed => {
      if (confirmed) {
        this.isSubmittingShift = true;
        this.staffService.checkInStaff(this.staff!.id).subscribe({
          next: (res) => {
            this.notification.success(CONSTANTS.STAFF_MODULE.DUTY_ON_SUCCESS.replace('{name}', this.staff!.firstName));
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
      title: CONSTANTS.STAFF_MODULE.SHIFT_CHECKOUT_CONFIRM_TITLE,
      message: CONSTANTS.STAFF_MODULE.SHIFT_CHECKOUT_CONFIRM_MSG.replace('{name}', this.staff.firstName),
      confirmText: 'Check-Out',
      cancelText: 'Cancel',
      type: 'warning'
    }).then(confirmed => {
      if (confirmed) {
        this.isSubmittingShift = true;
        this.staffService.checkOutStaff(this.staff!.id).subscribe({
          next: (res) => {
            this.notification.success(CONSTANTS.STAFF_MODULE.DUTY_OFF_SUCCESS.replace('{name}', this.staff!.firstName));
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

  navigateToTrainerMemberDetail(memberId: string): void {
    if (this.staff?.id) {
      this.router.navigate([`/gym-owner/trainers/${this.staff.id}/members/${memberId}`]);
    }
  }
}
