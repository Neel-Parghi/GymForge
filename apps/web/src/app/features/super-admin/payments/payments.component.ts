import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FIELD_LIMITS } from '../../../shared/constants/validation.constants';
import { phoneValidator } from '../../../shared/validators/custom-validators';
import { PaymentService } from '../../../core/services/payment.service';
import { PlanCheckoutService } from '../../../core/services/plan-checkout.service';
import { DataGrid } from '../../../shared/components/data-grid/data-grid.component';
import { CONSTANTS } from '../../../core/constants/constants';
import { GymService } from '../../../core/services/gym.service';
import { PricingService } from '../../../core/services/pricing.service';
import { PaymentStats, PaymentTransaction, SaaSConfiguration } from '../../../shared/models/payment.model';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';
import { AppGridConfig } from '../../../shared/constants/grid-config';

declare var Razorpay: any;

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, DataGrid, ReactiveFormsModule, DropdownComponent],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
})
export class PaymentsComponent implements OnInit {
  readonly limits = FIELD_LIMITS;


  private paymentService = inject(PaymentService);
  private planCheckout = inject(PlanCheckoutService);
  private gymService = inject(GymService);
  private pricingService = inject(PricingService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  // Forms
  settingsForm!: FormGroup;
  testPaymentForm!: FormGroup;

  // Selections for Payment Testing
  gyms: any[] = [];
  plans: any[] = [];

  activeTab: 'overview' | 'transactions' | 'settings' = 'overview';
  activeSettingsTab: 'financials' | 'gateway' | 'emails' = 'financials';

  stats?: PaymentStats;
  transactions: PaymentTransaction[] = [];
  settings?: SaaSConfiguration;
  isSaving = false;

  get gymOptions(): DropdownOption[] {
    return this.gyms.map(gym => ({
      label: gym.gymName,
      value: gym.id,
      icon: 'fa-solid fa-landmark'
    }));
  }

  get planOptions(): DropdownOption[] {
    return this.plans.map(plan => ({
      label: `${plan.name} (${plan.currency}${plan.price})`,
      value: plan.id,
      icon: 'fa-solid fa-gem'
    }));
  }

  readonly currencyOptions: DropdownOption[] = [
    { label: 'Indian Rupee (₹)', value: 'INR', icon: 'fa-solid fa-indian-rupee-sign' },
    { label: 'US Dollar ($)', value: 'USD', icon: 'fa-solid fa-dollar-sign' },
    { label: 'Euro (€)', value: 'EUR', icon: 'fa-solid fa-euro-sign' },
    { label: 'British Pound (£)', value: 'GBP', icon: 'fa-solid fa-sterling-sign' }
  ];

  gridConfig = AppGridConfig["PaymentList"];
  isAddPlanModalOpen: boolean = false;

  // Pagination state
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  ngOnInit() {
    this.initForms();
    this.loadStats();
    this.loadTransactions();
    this.loadGyms();
    this.loadPlans();
    this.checkQueryParams();
  }

  private checkQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.setActiveTab(params['tab']);
      }
    });
  }

  private initForms() {
    this.testPaymentForm = this.fb.group({
      selectedGymId: ['', Validators.required],
      selectedPlanId: ['', Validators.required]
    });

    this.settingsForm = this.fb.group({
      id: [''],
      taxPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      gracePeriodDays: [0, [Validators.required, Validators.min(0)]],
      yearlyRevenueTarget: [0],
      subscriptionTarget: [0],
      isMaintenanceMode: [false],
      currency: ['INR'],
      razorpayKeyId: ['', [Validators.maxLength(FIELD_LIMITS.API_KEY)]],
      razorpayKeySecret: ['', [Validators.maxLength(FIELD_LIMITS.API_KEY)]],
      billingEmail: ['', [Validators.email, Validators.maxLength(FIELD_LIMITS.EMAIL)]],
      supportPhone: ['', [Validators.maxLength(FIELD_LIMITS.PHONE), phoneValidator]]
    });
  }

  loadGyms() {
    this.gymService.getGymList().subscribe({
      next: (res) => {
        this.gyms = res.data.items;
      }
    });
  }

  loadPlans() {
    this.pricingService.getAllPlans().subscribe({
      next: (res) => {
        this.plans = res.data;
      }
    });
  }

  loadStats() {
    this.paymentService.getStats().subscribe({
      next: (res) => {
        this.stats = res.data;
      }
    })
  }

  loadTransactions() {
    this.paymentService.getTransactions().subscribe({
      next: (res) => {
        this.transactions = res.data;
      }
    });
  }

  loadSettings() {
    this.paymentService.getSettings().subscribe({
      next: (res) => {
        this.settings = res.data;
        if (this.settings) {
          this.settingsForm.patchValue(this.settings);
        }
      }
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) return;

    this.isSaving = true;
    this.paymentService.updateSettings(this.settingsForm.value).subscribe({
      next: () => {
        this.toastr.success(CONSTANTS.PAYMENT.MESSAGES.CONFIG_UPDATE_SUCCESS, CONSTANTS.COMMON_SUCCESS_TITLE);
        this.isSaving = false;
      },
      error: () => {
        this.toastr.error(CONSTANTS.PAYMENT.MESSAGES.CONFIG_UPDATE_ERROR, CONSTANTS.COMMON_ERROR_TITLE);
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
    if (this.testPaymentForm.invalid) {
      this.toastr.warning(CONSTANTS.PAYMENT.MESSAGES.SELECTION_REQUIRED, CONSTANTS.COMMON_WARNING_TITLE);
      return;
    }

    const { selectedGymId, selectedPlanId } = this.testPaymentForm.value;
    this.planCheckout.checkout({
      gymId: selectedGymId,
      planId: selectedPlanId,
      description: CONSTANTS.PAYMENT.RAZORPAY.FLOW_DESCRIPTION
    }).subscribe(outcome => {
      if (outcome.status === 'paid') {
        this.toastr.success(CONSTANTS.PAYMENT.MESSAGES.VERIFICATION_SUCCESS, CONSTANTS.COMMON_SUCCESS_TITLE + '!');
      } else if (outcome.status === 'failed') {
        this.toastr.error(outcome.message ?? CONSTANTS.PAYMENT.MESSAGES.VERIFICATION_ERROR, CONSTANTS.COMMON_ERROR_TITLE);
      }
      this.loadStats();
      this.loadTransactions();
    });
  }

  onPageChanged($event: number) {

  }
  onPageSizeChanged($event: number) {

  }
}
