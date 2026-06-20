import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MemberSubscription } from '../../../shared/models/member.model';
import { UserService } from '../../../core/services/user.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { GymService } from '../../../core/services/gym.service';
import { InvoiceDetailModalComponent } from '../../gym-owner/billing/components/invoice-detail-modal/invoice-detail-modal.component';

@Component({
  selector: 'app-user-billing',
  standalone: true,
  imports: [CommonModule, InvoiceDetailModalComponent],
  templateUrl: './user-billing.html',
  styleUrl: './user-billing.scss',
})
export class UserBilling implements OnInit {
  paymentHistory: MemberSubscription[] = [];
  isLoading = true;
  selectedInvoice: any = null;
  userProfile: any = null;
  myGymDetails: any = null;
  mainBranch: any = null;

  constructor(
    private userService: UserService,
    private authService: AuthApiService,
    private gymService: GymService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.fetchPaymentHistory();
    this.authService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });
    this.gymService.getMyGym().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.myGymDetails = res.data;
        }
      }
    });
    this.gymService.getMyBranches().subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.mainBranch = res.data.find(b => b.isMainBranch) || res.data[0];
        }
      }
    });
  }

  fetchPaymentHistory() {
    this.isLoading = true;
    this.userService.getMySubscriptions().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.paymentHistory = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load payment history');
        this.isLoading = false;
      }
    });
  }

  getStatusClass(payment: MemberSubscription): string {
    const statusStr = (payment.paymentStatusLabel || payment.paymentStatus || '').toString();
    return statusStr.toLowerCase();
  }

  getPaymentStatusText(status: number): string {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Paid';
      case 3: return 'Partial';
      case 4: return 'Refunded';
      default: return 'Unknown';
    }
  }

  openInvoice(payment: MemberSubscription, event: Event) {
    event.preventDefault();
    this.selectedInvoice = {
      id: payment.id,
      itemName: payment.planNameSnapshot || 'Gym Subscription',
      amount: payment.pricePaid,
      dateIssued: payment.startDate,
      dueDate: payment.startDate,
      memberName: this.userProfile ? `${this.userProfile.firstName} ${this.userProfile.lastName}` : 'Gym Member',
      email: this.userProfile?.email || '',
      membershipNumber: this.userProfile?.id ? this.userProfile.id.slice(-6).toUpperCase() : 'GM-001',
      status: this.getPaymentStatusText(payment.paymentStatus),
      taxRate: 18,
      planName: null,
      branchLine1: this.mainBranch?.address?.line1 || this.mainBranch?.address?.addressLine1,
      branchLine2: this.mainBranch?.address?.line2 || this.mainBranch?.address?.addressLine2,
      branchCity: this.mainBranch?.address?.city,
      branchState: this.mainBranch?.address?.state,
      branchPostalCode: this.mainBranch?.address?.postalCode || this.mainBranch?.address?.zipCode,
      branchName: this.mainBranch?.name
    };
  }

  closeInvoiceModal() {
    this.selectedInvoice = null;
  }
}
