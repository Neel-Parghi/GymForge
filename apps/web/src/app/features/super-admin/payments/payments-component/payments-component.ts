import { Component, inject, OnInit } from '@angular/core';
import { PaymentService } from '../../../../core/services/payment.service';
import { GymService } from '../../../../core/services/gym.service';
import { PricingService } from '../../../../core/services/pricing.service';
import { PaymentStats, PaymentTransaction, SaaSConfiguration } from '../../../../shared/models/payment.model';
import { CommonModule } from '@angular/common';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { AppGridConfig } from '../../../../shared/constants/grid-config';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CONSTANTS } from '../../../../core/constants/constants';

declare var Razorpay: any;

@Component({
  selector: 'app-payments-component',
  standalone: true,
  imports: [CommonModule, DataGrid, FormsModule],
  templateUrl: './payments-component.html',
  styleUrl: './payments-component.scss',
})
export class PaymentsComponent implements OnInit {

  private paymemtService = inject(PaymentService);
  private gymService = inject(GymService);
  private pricingService = inject(PricingService);
  private toastr = inject(ToastrService);

  // Selections for Payment Testing
  gyms: any[] = [];
  plans: any[] = [];
  selectedGymId: string = '';
  selectedPlanId: string = '';

  activeTab: 'overview' | 'transactions' | 'settings' = 'overview';
  activeSettingsTab: 'general' | 'gateway' | 'emails' = 'general';

  stats?: PaymentStats;
  transactions: PaymentTransaction[] = [];
  settings?: SaaSConfiguration;
  isSaving = false;

  gridConfig = AppGridConfig["PaymentList"];

  // Pagination state
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  ngOnInit() {
    this.loadStats();
    this.loadTransactions();
    this.loadGyms();
    this.loadPlans();
  }

  loadGyms() {
    this.gymService.getGymList().subscribe({
      next: (res) => {
        this.gyms = res.Data;
        console.log(this.gyms)
      }
    });
  }

  loadPlans() {
    this.pricingService.getAllPlans().subscribe({
      next: (res) => {
        this.plans = res.Data;
      }
    });
  }

  loadStats() {
    this.paymemtService.getStats().subscribe({
      next: (res) => {
        this.stats = res.Data;
      }
    })
  }

  loadTransactions() {
    this.paymemtService.getTransactions().subscribe({
      next: (res) => {
        this.transactions = res.Data;
      }
    });
  }

  loadSettings() {
    this.paymemtService.getSettings().subscribe({
      next: (res) => {
        this.settings = res.Data;
      }
    });
  }

  saveSettings() {
    if (!this.settings) return;

    this.isSaving = true;
    this.paymemtService.updateSettings(this.settings).subscribe({
      next: () => {
        this.toastr.success(CONSTANTS.PAYMENT.MESSAGES.CONFIG_UPDATE_SUCCESS, 'Success');
        this.isSaving = false;
      },
      error: () => {
        this.toastr.error(CONSTANTS.PAYMENT.MESSAGES.CONFIG_UPDATE_ERROR, 'Error');
        this.isSaving = false;
      }
    });
  }

  setActiveTab(tab: 'overview' | 'transactions' | 'settings') {
    this.activeTab = tab;
    if (tab === 'settings' && !this.settings) {
      this.loadSettings();
    }
  }

  payWithRazorpay() {
    if (!this.selectedGymId || !this.selectedPlanId) {
      this.toastr.warning(CONSTANTS.PAYMENT.MESSAGES.SELECTION_REQUIRED, 'Selection Required');
      return;
    }

    const request = {
      gymId: this.selectedGymId,
      planId: this.selectedPlanId
    };

    this.paymemtService.initiatePayment(request).subscribe({
      next: (res: any) => {
        const options = {
          key: CONSTANTS.PAYMENT.RAZORPAY.KEY_ID,
          amount: res.Data.transactionResponse.amount,
          currency: CONSTANTS.PAYMENT.RAZORPAY.CURRENCY,
          order_id: res.Data.transactionResponse.razorpayOrderId,
          name: CONSTANTS.PAYMENT.RAZORPAY.COMPANY_NAME,
          description: CONSTANTS.PAYMENT.RAZORPAY.FLOW_DESCRIPTION,
          handler: (response: any) => {
            console.log('Razorpay Success Response:', response);
            this.verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
          },
          prefill: {
            name: 'Neel Parghi',
            email: 'test@example.com'
          },
          theme: { color: CONSTANTS.PAYMENT.RAZORPAY.THEME_COLOR }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    });

  }

  verifyPayment(orderId: string, paymentId: string, signature: string) {
    this.paymemtService.verifyPayment({
      orderId: orderId,
      paymentId: paymentId,
      signature: signature
    }).subscribe({
      next: () => {
        this.toastr.success(CONSTANTS.PAYMENT.MESSAGES.VERIFICATION_SUCCESS, 'Success!');
        this.loadStats();
        this.loadTransactions();
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || CONSTANTS.PAYMENT.MESSAGES.VERIFICATION_ERROR;
        this.toastr.error(errorMsg, 'Error');
        this.loadStats();
        this.loadTransactions();
      }
    });
  }

  onPageChanged($event: number) {

  }
  onPageSizeChanged($event: number) {

  }
}
