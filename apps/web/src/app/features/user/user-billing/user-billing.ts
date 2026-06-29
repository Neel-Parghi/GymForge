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
  activeTab: 'history' | 'plans' = 'history';
  availablePlans: any[] = [];
  isGymLoading = true;
  showPaymentMethodModal = false;
  selectedPlanForUpgrade: any = null;

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
        this.isGymLoading = false;
      },
      error: (err) => {
        this.isGymLoading = false;
      }
    });
    this.gymService.getMyBranches().subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.mainBranch = res.data.find((b: any) => b.isMainBranch) || res.data[0];
        }
      }
    });
    this.fetchAvailablePlans();
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

  fetchAvailablePlans() {
    this.userService.getAvailablePlans().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.availablePlans = res.data;
          console.log(this.availablePlans)
        } else if (Array.isArray(res)) {
          this.availablePlans = res;
        } else if (res && res.value) {
          this.availablePlans = res.value;
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load available plans');
      }
    });
  }

  getStatusClass(payment: MemberSubscription): string {
    const statusStr = (payment.paymentStatusLabel || payment.paymentStatus || '').toString();
    return statusStr.toLowerCase();
  }

  isCurrentPlan(planId: string): boolean {
    return this.paymentHistory.some(p => p.isActive && p.gymPlanId === planId);
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

  initiateUpgrade(plan: any) {
    this.selectedPlanForUpgrade = plan;
    this.showPaymentMethodModal = true;
  }

  closePaymentMethodModal() {
    this.showPaymentMethodModal = false;
    this.selectedPlanForUpgrade = null;
  }

  confirmPaymentMethod(method: 'online' | 'offline') {
    if (!this.selectedPlanForUpgrade) return;
    this.showPaymentMethodModal = false;

    if (method === 'online') {
      this.processOnlineUpgrade(this.selectedPlanForUpgrade);
    } else {
      this.processOfflineUpgrade(this.selectedPlanForUpgrade);
    }
  }

  private processOnlineUpgrade(plan: any) {
    this.isLoading = true;
    this.userService.initiateUpgradeCheckout(plan.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.openRazorpayCheckout(res.value, plan);
        } else {
          this.toastr.error(res.error || 'Failed to initiate checkout.');
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to initiate checkout.');
        this.isLoading = false;
      }
    });
  }

  private processOfflineUpgrade(plan: any) {
    this.isLoading = true;
    this.userService.initiateOfflineCheckout(plan.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success('Invoice created. Please pay the gym owner directly to complete.');
          this.activeTab = 'history';
          this.fetchPaymentHistory();
        } else {
          this.toastr.error(res.error || 'Failed to create offline invoice.');
        }
        this.isLoading = false;
        this.selectedPlanForUpgrade = null;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to initiate offline checkout.');
        this.isLoading = false;
        this.selectedPlanForUpgrade = null;
      }
    });
  }

  private openRazorpayCheckout(paymentDetails: any, plan: any) {
    const options = {
      key: paymentDetails.keyId,
      amount: paymentDetails.amount * 100,
      currency: paymentDetails.currency,
      name: this.myGymDetails?.gymName || 'Gym Subscription',
      description: `Upgrade to ${plan.name}`,
      order_id: paymentDetails.orderId,
      handler: (response: any) => {
        this.verifyPayment(response, plan.id);
      },
      prefill: {
        name: this.userProfile ? `${this.userProfile.firstName} ${this.userProfile.lastName}` : '',
        email: this.userProfile?.email || '',
        contact: this.userProfile?.phoneNumber || ''
      },
      theme: {
        color: '#0284c7'
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      this.toastr.error('Payment failed. Please try again.');
      this.isLoading = false;
    });
    rzp.open();
  }

  private verifyPayment(response: any, planId: string) {
    const payload = {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
      planId: planId,
      userId: this.userProfile?.id
    };

    this.userService.verifyUpgradeCheckout(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success('Payment successful! Subscription activated.');
          this.activeTab = 'history';
          this.fetchPaymentHistory();
        } else {
          this.toastr.error(res.error || 'Payment verification failed.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Payment verification failed.');
        this.isLoading = false;
      }
    });
  }
}
