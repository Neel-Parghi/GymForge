import { Component, OnInit, ViewChild, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MemberService } from '../../../core/services/member.service';
import { GymPlanService } from '../../../core/services/gym-plan.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { DataGrid } from '../../../shared/components/data-grid/data-grid.component';
import { AppGridConfig } from '../../../shared/constants/grid-config';
import { OnboardMemberModal } from './onboard-member-modal/onboard-member-modal.component';
import { MemberDetailDrawer } from './member-detail-drawer/member-detail-drawer.component';
import { GymMember, MemberStatus, OnboardMemberRequest, RenewSubscriptionRequest } from '../../../shared/models/member.model';
import { GymPlan } from '../../../shared/models/gym-plan.model';
import { PaymentStatus } from '../../../shared/enums/member-enums';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';
import { CONSTANTS } from '../../../core/constants/constants';

@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataGrid, OnboardMemberModal, MemberDetailDrawer, DropdownComponent],
  templateUrl: './members-list.component.html',
  styleUrl: './members-list.component.scss'
})
export class MembersListComponent implements OnInit {
  private memberService = inject(MemberService);
  private gymPlanService = inject(GymPlanService);
  private authService = inject(AuthApiService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  @ViewChild(OnboardMemberModal) onboardModal!: OnboardMemberModal;

  // State
  members: GymMember[] = [];
  filteredMembers: GymMember[] = [];
  activePlans: GymPlan[] = [];
  loading = false;
  searchQuery = '';
  gymId: string | null = null;
  gymOwnerId: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // DataGrid config
  gridConfig = AppGridConfig['GymMembers'];

  // Status filter
  activeFilter: MemberStatus | 'all' = 'all';
  selectedPlan: string = 'all';
  selectedPaymentStatus: string = 'all';
  // Filter options
  get planOptions(): DropdownOption[] {
    const options: DropdownOption[] = [{ label: 'All Plans', value: 'all' }];
    this.activePlans.forEach(p => options.push({ label: p.name, value: p.id }));
    return options;
  }

  readonly paymentOptions: DropdownOption[] = [
    { label: 'All Payments', value: 'all' },
    { label: 'Paid', value: '2' },
    { label: 'Unpaid', value: '0' },
    { label: 'Pending', value: '1' },
    { label: 'Partial', value: '3' },
    { label: 'Refunded', value: '4' }
  ];

  // View Mode
  viewMode: 'list' | 'dashboard' = 'list';

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'dashboard' : 'list';
  }

  // Modal / Drawer state
  isOnboardOpen = false;
  isEditMode = false;
  isDrawerOpen = false;
  selectedMember: GymMember | null = null;

  // Stats
  get totalCount(): number { return this.members.length; }
  get activeCount(): number { return this.members.filter(m => m.status === MemberStatus.Active).length; }
  get frozenCount(): number { return this.members.filter(m => m.status === MemberStatus.Freeze).length; }
  get expiredCount(): number { return this.members.filter(m => m.status === MemberStatus.Expired).length; }
  get totalPages(): number { return Math.ceil(this.filteredMembers.length / this.pageSize); }

  readonly filterTabs = [
    { label: 'All', value: 'all' as const },
    { label: 'Active', value: MemberStatus.Active as const },
    { label: 'Inactive', value: MemberStatus.Inactive as const },
    { label: 'Frozen', value: MemberStatus.Freeze as const },
    { label: 'Expired', value: MemberStatus.Expired as const },
  ];

  ngOnInit(): void {
    const user = this.authService.getUserProfile();
    this.gymId = user?.gymId || this.authService.getGymId();
    this.gymOwnerId = user?.id || null;

    if (this.gymId) {
      this.loadMembers();
      this.loadPlans();
    }
  }

  // Data Loading
  loadMembers(): void {
    if (!this.gymId) return;
    this.loading = true;
    this.memberService.getGymMembers(this.gymId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.members = data.data.map(m => ({
            ...m,
            statusLabel: this.getStatusLabel(m.status),
            currentSubscription: m.currentSubscription ? {
              ...m.currentSubscription,
              paymentStatusLabel: this.getPaymentStatusLabel(m.currentSubscription.paymentStatus)
            } : undefined
          }));
          this.filterMembers();
        },
        error: () => this.notificationService.error(CONSTANTS.MEMBERS_MODULE.LOAD_ERROR)
      });
  }

  loadPlans(): void {
    if (!this.gymOwnerId) return;
    this.gymPlanService.getPlansByOwnerId(this.gymOwnerId).subscribe({
      next: (plans) => this.activePlans = plans.data.filter(p => p.isActive),
      error: () => { }
    });
  }

  exportToCsv(): void {
    if (!this.gymId) return;
    this.memberService.exportMembers(this.gymId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GymForge_Members_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.success(CONSTANTS.MEMBERS_MODULE.EXPORT_SUCCESS);
      },
      error: () => this.notificationService.error(CONSTANTS.MEMBERS_MODULE.EXPORT_ERROR)
    });
  }

  // Filtering
  filterMembers(): void {
    let result = [...this.members];

    if (this.activeFilter !== 'all')
      result = result.filter(m => m.status === this.activeFilter);

    if (this.selectedPlan !== 'all')
      result = result.filter(m => m.currentSubscription?.gymPlanId === this.selectedPlan);

    if (this.selectedPaymentStatus !== 'all')
      result = result.filter(m => m.currentSubscription?.paymentStatus.toString() === this.selectedPaymentStatus);

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(m =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.membershipNumber.toLowerCase().includes(q)
      );
    }

    this.filteredMembers = result;
    this.currentPage = 1;
  }

  setFilter(f: MemberStatus | 'all'): void {
    this.activeFilter = f;
    this.filterMembers();
  }

  // Grid events
  onAction(event: { action: string; row: GymMember }): void {
    if (event.action === 'view') {
      this.viewDetails(event.row.id);
    } else if (event.action === 'edit') {
      this.openEditModal(event.row.id, event.row);
    } else if (event.action === 'delete') {
      this.handleDeleteMember(event.row);
    }
  }

  handleDeleteMember(member: GymMember): void {
    this.confirmationService.confirm({
      title: CONSTANTS.MEMBERS_MODULE.DELETE_CONFIRM_TITLE,
      message: CONSTANTS.MEMBERS_MODULE.DELETE_CONFIRM_MSG.replace('{name}', `${member.firstName} ${member.lastName}`),
      confirmText: 'Remove Member',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.memberService.deleteMember(member.id).subscribe({
          next: () => {
            this.notificationService.success(CONSTANTS.MEMBERS_MODULE.DELETE_SUCCESS);
            this.memberService.clearCache();
            this.loadMembers();
          },
          error: () => this.notificationService.error(CONSTANTS.MEMBERS_MODULE.DELETE_ERROR)
        });
      }
    });
  }

  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }

  openOnboardModal(): void {
    this.isEditMode = false;
    this.selectedMember = null;
    this.isOnboardOpen = true;
  }

  openEditModal(memberId: string, memberData?: GymMember): void {
    this.isEditMode = true;
    this.isDrawerOpen = false;
    this.selectedMember = null;

    if (memberData) {
      this.selectedMember = { ...memberData };
      this.isOnboardOpen = true;
    } else {
      this.memberService.getMemberById(memberId).subscribe(m => {
        this.selectedMember = m.data;
        this.isOnboardOpen = true;
      });
    }
  }

  handleOnboard(payload: OnboardMemberRequest): void {
    if (!this.gymId) return;
    this.memberService.onboardMember(this.gymId, payload).subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.MEMBERS_MODULE.ONBOARD_SUCCESS);
        this.isOnboardOpen = false;
        this.memberService.clearCache();
        this.loadMembers();
      },
      error: (err) => {
        const msg = err?.error?.message ?? CONSTANTS.MEMBERS_MODULE.ONBOARD_ERROR;
        this.onboardModal?.setError(msg);
      }
    });
  }

  handleUpdate(payload: OnboardMemberRequest): void {
    if (!this.selectedMember) return;
    this.memberService.updateMember(this.selectedMember.id, payload).subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.MEMBERS_MODULE.UPDATE_SUCCESS);
        this.isOnboardOpen = false;
        this.memberService.clearCache();
        this.loadMembers();
      },
      error: (err) => {
        const msg = err?.error?.message ?? CONSTANTS.MEMBERS_MODULE.UPDATE_ERROR;
        this.onboardModal?.setError(msg);
      }
    });
  }

  // Detail Drawer
  viewDetails(memberId: string): void {
    this.selectedMember = null;
    this.memberService.getMemberById(memberId).subscribe({
      next: (m) => {
        if (m.success && m.data) {
          this.selectedMember = { ...m.data, statusLabel: this.getStatusLabel(m.data.status) };
          this.isDrawerOpen = true;
        } else {
          this.notificationService.error(CONSTANTS.MEMBERS_MODULE.DETAIL_LOAD_ERROR_PREFIX + m.message);
        }
      },
      error: (err) => {
        console.error('Error fetching member details:', err);
        this.notificationService.error(CONSTANTS.MEMBERS_MODULE.DETAIL_LOAD_ERROR);
      }
    });
  }

  handleFreeze(memberId: string): void {
    this.memberService.freezeMember(memberId).subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.MEMBERS_MODULE.FREEZE_SUCCESS);
        this.memberService.clearCache();
        this.refreshDrawer(memberId);
      },
      error: () => this.notificationService.error(CONSTANTS.MEMBERS_MODULE.FREEZE_ERROR)
    });
  }

  handleUnfreeze(memberId: string): void {
    this.memberService.unfreezeMember(memberId).subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.MEMBERS_MODULE.UNFREEZE_SUCCESS);
        this.memberService.clearCache();
        this.refreshDrawer(memberId);
      },
      error: () => this.notificationService.error(CONSTANTS.MEMBERS_MODULE.UNFREEZE_ERROR)
    });
  }

  handleToggle(memberId: string): void {
    this.memberService.toggleMemberStatus(memberId).subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.MEMBERS_MODULE.STATUS_UPDATE_SUCCESS);
        this.memberService.clearCache();
        this.refreshDrawer(memberId);
      },
      error: () => this.notificationService.error(CONSTANTS.MEMBERS_MODULE.STATUS_UPDATE_ERROR)
    });
  }

  handleRenew(event: { memberId: string; request: RenewSubscriptionRequest }): void {
    this.memberService.renewSubscription(event.memberId, event.request).subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.MEMBERS_MODULE.RENEW_SUCCESS);
        this.memberService.clearCache();
        this.refreshDrawer(event.memberId);
      },
      error: () => this.notificationService.error(CONSTANTS.MEMBERS_MODULE.RENEW_ERROR)
    });
  }

  private refreshDrawer(memberId: string): void {
    this.loadMembers();
    this.memberService.getMemberById(memberId).subscribe({
      next: (m) => this.selectedMember = { ...m.data, statusLabel: this.getStatusLabel(m.data.status) },
      error: () => { }
    });
  }

  // Helpers
  getStatusLabel(status: MemberStatus): string {
    switch (status) {
      case MemberStatus.Active: return 'Active';
      case MemberStatus.Inactive: return 'Inactive';
      case MemberStatus.Expired: return 'Expired';
      case MemberStatus.Freeze: return 'Frozen';
      default: return 'Unknown';
    }
  }

  getPaymentStatusLabel(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Paid: return 'Paid';
      case PaymentStatus.Pending: return 'Pending';
      case PaymentStatus.Partial: return 'Partial';
      case PaymentStatus.Refunded: return 'Refunded';
      default: return 'Unpaid';
    }
  }
}
