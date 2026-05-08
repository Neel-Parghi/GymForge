import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffResponse } from '../../../../core/models/staff.model';
import { StaffService } from '../../../../core/services/staff.service';
import { SlideDrawerComponent } from '../../../../shared/components/slide-drawer/slide-drawer.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-staff-detail-drawer',
  standalone: true,
  imports: [CommonModule, SlideDrawerComponent],
  templateUrl: './staff-detail-drawer.component.html',
  styleUrl: './staff-detail-drawer.component.scss'
})
export class StaffDetailDrawerComponent {
  private staffService = inject(StaffService);
  private notification = inject(NotificationService);

  @Input() isOpen = false;
  @Input() staff: StaffResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<StaffResponse>();
  @Output() statusChanged = new EventEmitter<void>();

  activeTab: 'details' | 'members' = 'details';
  assignedMembers: any[] = [];
  isLoadingMembers = false;

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

  onClose() {
    this.activeTab = 'details';
    this.close.emit();
  }

  setActiveTab(tab: 'details' | 'members') {
    this.activeTab = tab;
    if (tab === 'members' && this.assignedMembers.length === 0) {
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
}
