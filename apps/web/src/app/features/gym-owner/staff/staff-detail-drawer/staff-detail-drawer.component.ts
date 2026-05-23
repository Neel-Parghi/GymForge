import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { StaffResponse } from '../../../../core/models/staff.model';
import { StaffService } from '../../../../core/services/staff.service';
import { MemberService } from '../../../../core/services/member.service';
import { SlideDrawerComponent } from '../../../../shared/components/slide-drawer/slide-drawer.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../shared/models/dropdown.model';
import { NotificationService } from '../../../../core/services/notification.service';

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

  @Input() isOpen = false;
  @Input() staff: StaffResponse | null = null;
  @Input() branches: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<StaffResponse>();
  @Output() statusChanged = new EventEmitter<void>();

  activeTab: 'details' | 'members' = 'details';
  assignedMembers: any[] = [];
  isLoadingMembers = false;

  members: any[] = [];
  isLoadingMembersList = false;
  isAssignFormOpen = false;
  memberSelectControl = new FormControl('', Validators.required);
  preferredSlotControl = new FormControl('');
  isSubmittingAssignment = false;

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

  onClose() {
    this.activeTab = 'details';
    this.closeAssignForm();
    this.close.emit();
  }

  setActiveTab(tab: 'details' | 'members') {
    this.activeTab = tab;
    this.closeAssignForm();
    if (tab === 'members') {
      this.loadMembers();
    }
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
  }

  submitAssignment() {
    if (!this.staff || this.memberSelectControl.invalid) return;
    this.isSubmittingAssignment = true;
    this.staffService.assignTrainerToMember(this.staff.id, this.memberSelectControl.value!, this.preferredSlotControl.value || '').subscribe({
      next: () => {
        this.notification.success('Member assigned to trainer successfully!');
        this.isSubmittingAssignment = false;
        this.closeAssignForm();
        this.loadMembers(); // Refresh members list
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Failed to assign member.');
        this.isSubmittingAssignment = false;
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

    // We'll implement status toggle in the service soon
    this.notification.info('Status toggle functionality coming soon.');
  }

  getBranchName(branchId?: string): string {
    if (!branchId) return 'No Branch (General)';
    const branch = this.branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Unknown Branch';
  }
}
