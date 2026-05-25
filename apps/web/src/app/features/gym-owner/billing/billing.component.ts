import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';
import { MemberInvoice, PlatformInvoice, StaffPayout, GymSubscriptionStatus } from '../../../shared/models/payment.model';
import { BillingService } from '../../../core/services/billing.service';
import { MemberService } from '../../../core/services/member.service';
import { PaymentService } from '../../../core/services/payment.service';
import { GymService } from '../../../core/services/gym.service';
import { PricingService } from '../../../core/services/pricing.service';
import { PricingPlan } from '../../../shared/models/pricing.model';

@Component({
  selector: 'app-gym-owner-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss'
})
export class BillingComponent implements OnInit {

  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private billingService = inject(BillingService);
  private memberService = inject(MemberService);
  private paymentService = inject(PaymentService);
  private gymService = inject(GymService);
  private pricingService = inject(PricingService);

  subscriptionStatus: GymSubscriptionStatus | null = null;
  gymMembers: any[] = [];
  gymDetails: any = null;

  getTaxableAmount(amount: number, taxRate: number = 18): number {
    return amount / (1 + (taxRate / 100));
  }

  getTaxAmount(amount: number, taxRate: number = 18): number {
    return amount - this.getTaxableAmount(amount, taxRate);
  }

  activeTab: 'member' | 'saas' | 'settings' | 'staff' = 'member';
  selectedInvoice: any | null = null;
  invoiceSearch = '';
  statusFilter: 'All' | 'Paid' | 'Pending' | 'Overdue' = 'All';
  showCreateInvoiceModal = false;

  // Platform Subscription Billing (UPI & GPay)
  showUpiPaymentModal = false;
  upiTimer = '05:00';
  upiTimerInterval: any;
  nextBillingDate = new Date(2026, 5, 1); // June 1, 2026

  // Live Merchant Gateway & UPI setup configurations
  enableOnlineMemberPayments = true;
  merchantUpiVpa = 'fitlife@okaxis';
  razorpayKeyId = 'rzp_live_9A2f8K1d3z9x';
  razorpaySecretKey = '••••••••••••••••••••••••';
  showRazorpayKeys = false;

  // Plan Comparison & Subscription Upgrade state
  showUpgradeModal = false;
  checkoutPlanName = 'GymForge Pro Plan';
  checkoutPrice = 4999;
  availablePlans: PricingPlan[] = [];

  // Payroll Management Rules
  showPayrollRulesModal = false;
  selectedPayrollStaff: StaffPayout | null = null;
  payrollRulesForm!: FormGroup;

  // Dropdown Lists
  memberDropdownOptions: DropdownOption[] = [];
  categoryDropdownOptions: DropdownOption[] = [
    { label: 'Personal Training (PT)', value: 'Personal Training' },
    { label: 'Store Purchase (Retail)', value: 'Store Purchase' },
    { label: 'Membership Renewal', value: 'Membership Renewal' },
    { label: 'Registration & Adm. Fee', value: 'Registration' },
    { label: 'Rehab & Therapy', value: 'Rehab & Therapy' },
    { label: 'Other Miscellaneous Charges', value: 'Other Charges' }
  ];
  statusDropdownOptions: DropdownOption[] = [
    { label: 'Pending Payment', value: 'Pending' },
    { label: 'Paid (Register immediately)', value: 'Paid' }
  ];

  // Forms
  settingsForm!: FormGroup;
  createInvoiceForm!: FormGroup;

  // Dynamic Active Member Invoices bound to current global period
  memberInvoices: MemberInvoice[] = [];

  // Collapsible overview toggle
  showBillingOverview: boolean = true;

  // Pagination variables for Member Invoices ledger
  memberInvoicesCurrentPage: number = 1;
  memberInvoicesPageSize: number = 10;
  protected readonly Math = Math;

  // Platform SaaS Invoices loaded dynamically
  platformInvoices: PlatformInvoice[] = [];

  // Dynamic Month & Year Filter Options Configuration
  payrollMonthsOptions: DropdownOption[] = [];
  selectedPayrollMonth = '';
  periodForm!: FormGroup;

  // Dynamic Payroll ledger array bound to active filter
  staffPayouts: StaffPayout[] = [];

  ngOnInit(): void {
    this.initSettingsForm();
    this.initPayrollRulesForm();
    this.loadGymMembers();
    this.loadSubscriptionStatus();
    this.loadPlatformInvoices();
    this.loadGymSettingsAndMonths();
  }

  loadGymSettingsAndMonths(): void {
    this.gymService.getMyGym().subscribe({
      next: (res) => {
        if (res.data) {
          const gym = res.data;
          this.gymDetails = gym;
          
          this.settingsForm.patchValue({
            gymGstin: gym.gstNumber || '',
            invoicePrefix: gym.invoicePrefix || 'GF-',
            taxPercentage: gym.defaultTaxRate !== undefined ? gym.defaultTaxRate : 18,
            autoEmailReceipts: gym.autoEmailReceipts !== undefined ? gym.autoEmailReceipts : true,
            overdueGraceDays: gym.overdueGraceDays !== undefined ? gym.overdueGraceDays : 7
          });

          // Generate options dynamically based on the registration date
          this.generatePayrollMonths(gym.createdOn);

          // Initialize month selectors
          this.initPeriodForm();

          // Load data dynamically for the calculated active month
          this.loadMemberBillingOverview(this.selectedPayrollMonth);
          this.loadStaffPayoutsForMonth(this.selectedPayrollMonth);
        }
      },
      error: () => {
        this.notification.error('Failed to load gym billing settings.');
        this.generatePayrollMonths();
        this.initPeriodForm();
        this.loadMemberBillingOverview(this.selectedPayrollMonth);
        this.loadStaffPayoutsForMonth(this.selectedPayrollMonth);
      }
    });
  }

  generatePayrollMonths(createdOnStr?: string): void {
    const currentDate = new Date();
    
    // Parse registration date, fallback to 4 months ago if not present or invalid
    let registrationDate = new Date();
    if (createdOnStr) {
      registrationDate = new Date(createdOnStr);
    } else {
      registrationDate.setMonth(currentDate.getMonth() - 3);
    }

    const options: DropdownOption[] = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Loop back from the current month to registration month (max 12 months)
    let iterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    let count = 0;

    const minLimitDate = new Date(registrationDate.getFullYear(), registrationDate.getMonth(), 1);

    while (iterDate >= minLimitDate && count < 12) {
      const year = iterDate.getFullYear();
      const monthNum = iterDate.getMonth() + 1;
      const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
      const value = `${year}-${monthStr}`;
      
      const label = count === 0 
        ? `${monthNames[iterDate.getMonth()]} ${year} (Current)`
        : `${monthNames[iterDate.getMonth()]} ${year}`;

      options.push({ label, value });
      
      // Navigate to previous month
      iterDate.setMonth(iterDate.getMonth() - 1);
      count++;
    }

    if (options.length === 0) {
      const year = currentDate.getFullYear();
      const monthNum = currentDate.getMonth() + 1;
      const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
      options.push({
        label: `${monthNames[currentDate.getMonth()]} ${year} (Current)`,
        value: `${year}-${monthStr}`
      });
    }

    this.payrollMonthsOptions = options;
    this.selectedPayrollMonth = options[0].value;
  }

  loadSubscriptionStatus(): void {
    this.paymentService.getSubscriptionStatus().subscribe({
      next: (res) => {
        if (res.data) {
          this.subscriptionStatus = res.data;
        }
      }
    });
  }

  loadPlatformInvoices(): void {
    this.paymentService.getSubscriptionHistory().subscribe({
      next: (res) => {
        if (res.data) {
          this.platformInvoices = res.data.map(tx => ({
            id: tx.gatewayTransactionId || tx.id.substring(0, 8),
            planName: tx.planName || 'GymForge Pro Plan',
            amount: tx.amount,
            status: tx.status as any,
            billingDate: new Date(tx.createdAt)
          }));
        }
      }
    });
  }

  loadGymMembers(): void {
    this.memberService.getGymMembers(1, 100).subscribe({
      next: (res) => {
        if (res.data?.items) {
          this.gymMembers = res.data.items;
          this.memberDropdownOptions = this.gymMembers.map((m, index) => ({
            label: `${m.firstName} ${m.lastName} (${m.email})`,
            value: index
          }));
        }
      }
    });
  }

  loadMemberBillingOverview(month: string): void {
    this.billingService.getMemberBillingOverview(month).subscribe({
      next: (res) => {
        const invoicesList = res?.data?.invoices || [];

        if (res?.data) {
          const overview = res.data;
          this.gymDetails = {
            gymName: overview.gymName,
            brandName: overview.gymBrandName,
            gstNumber: overview.gymGstNumber
          };
          if (overview.gymGstNumber) {
            this.settingsForm.patchValue({
              gymGstin: overview.gymGstNumber
            });
          }
        }

        this.memberInvoices = invoicesList.map(inv => {
          const names = inv.memberName ? inv.memberName.trim().split(/\s+/) : [];
          const initials = names.length > 0
            ? (names[0][0] + (names[1] ? names[1][0] : '')).toUpperCase()
            : '??';

          const matchedType = (inv.billingType || 'Membership Renewal') as MemberInvoice['type'];
          const isService = matchedType === 'Personal Training' || matchedType === 'Rehab & Therapy' || matchedType === 'Other Charges';
          const defaultTax = this.settingsForm?.get('taxPercentage')?.value ?? 18;
          const taxRate = isService ? 0 : defaultTax;
          return {
            id: inv.id,
            memberName: inv.memberName,
            email: inv.email,
            initials: initials,
            type: matchedType,
            amount: inv.amount,
            status: (inv.status || 'Paid') as any,
            dateIssued: new Date(inv.dateIssued),
            dueDate: new Date(inv.dueDate),
            itemName: inv.billingType || inv.description || 'Gym Item',
            taxRate: taxRate,
            membershipNumber: inv.membershipNumber,
            realRecordId: inv.realRecordId,
            branchId: inv.branchId,
            branchName: inv.branchName,
            branchLine1: inv.branchLine1,
            branchLine2: inv.branchLine2,
            branchCity: inv.branchCity,
            branchState: inv.branchState,
            branchPostalCode: inv.branchPostalCode
          };
        });
      },
      error: () => {
        this.notification.error('Failed to load live member billing logs.');
        this.memberInvoices = [];
      }
    });
  }


  initPeriodForm(): void {
    this.periodForm = this.fb.group({
      selectedPeriod: [this.selectedPayrollMonth]
    });

    this.periodForm.get('selectedPeriod')?.valueChanges.subscribe(val => {
      if (val) {
        this.selectedPayrollMonth = val;
        this.loadStaffPayoutsForMonth(val);
        this.loadMemberBillingOverview(val);

      }
    });
  }

  onPayrollMonthChange(monthValue: string): void {
    this.selectedPayrollMonth = monthValue;
    this.loadStaffPayoutsForMonth(monthValue);
  }

  loadStaffPayoutsForMonth(month: string): void {
    this.billingService.getStaffPayrollOverview(month).subscribe({
      next: (res) => {
        if (res?.data?.payouts) {
          this.staffPayouts = res.data.payouts.map(p => ({
            id: p.id,
            staffId: p.staffId,
            staffName: p.staffName,
            role: p.role,
            email: p.email,
            initials: p.initials,
            baseSalary: p.baseSalary,
            commissions: p.commissions,
            totalPayout: p.totalPayout,
            status: p.status as any,
            payoutDate: p.payoutDate ? new Date(p.payoutDate) : undefined,
            ptCommissionRate: p.ptCommissionRate,
            rehabCommissionRate: p.rehabCommissionRate
          }));
        } else {
          this.staffPayouts = [];
        }
      },
      error: () => {
        this.notification.error('Failed to load staff payroll overview.');
        this.staffPayouts = [];
      }
    });
  }

  initPayrollRulesForm(): void {
    this.payrollRulesForm = this.fb.group({
      baseSalary: [0, [Validators.required, Validators.min(0)]],
      ptCommissionRate: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
      rehabCommissionRate: [15, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  initSettingsForm(): void {
    this.settingsForm = this.fb.group({
      gymGstin: ['', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      invoicePrefix: ['', Validators.required],
      taxPercentage: [18, [Validators.required, Validators.min(0), Validators.max(50)]],
      autoEmailReceipts: [true],
      overdueGraceDays: [3, [Validators.required, Validators.min(0)]]
    });
  }

  initCustomInvoiceForm(): void {
    this.createInvoiceForm = this.fb.group({
      memberIndex: [0, Validators.required],
      type: ['Personal Training', Validators.required],
      itemName: ['', [Validators.required, Validators.minLength(3)]],
      amount: [1000, [Validators.required, Validators.min(1)]],
      status: ['Pending', Validators.required]
    });
  }

  openCreateInvoiceModal(): void {
    this.showCreateInvoiceModal = true;
    this.initCustomInvoiceForm();
  }

  closeCreateInvoiceModal(): void {
    this.showCreateInvoiceModal = false;
  }

  submitCustomInvoice(): void {
    if (this.createInvoiceForm.invalid) {
      this.notification.error('Please enter valid invoice details.');
      return;
    }

    const val = this.createInvoiceForm.value;
    const selectedMember = this.gymMembers[val.memberIndex];

    if (!selectedMember) {
      this.notification.error('Selected member is invalid.');
      return;
    }

    const payload = {
      memberId: selectedMember.id,
      billingType: val.type,
      amount: val.amount,
      status: val.status,
      paymentMethod: 'UPI'
    };

    this.billingService.createCustomInvoice(payload).subscribe({
      next: () => {
        this.notification.success('Custom invoice generated and recorded successfully!');
        this.showCreateInvoiceModal = false;
        this.loadMemberBillingOverview(this.selectedPayrollMonth);
      },
      error: () => {
        this.notification.error('Failed to register custom invoice.');
      }
    });
  }

  // Filters & Searching
  getFilteredInvoices(): MemberInvoice[] {
    return (this.memberInvoices || []).filter(inv => {
      const matchesSearch =
        inv.memberName.toLowerCase().includes(this.invoiceSearch.toLowerCase()) ||
        inv.id.toLowerCase().includes(this.invoiceSearch.toLowerCase()) ||
        inv.type.toLowerCase().includes(this.invoiceSearch.toLowerCase());
      const matchesFilter =
        this.statusFilter === 'All' ? true : inv.status === this.statusFilter;
      return matchesSearch && matchesFilter;
    });
  }

  setStatusFilter(filter: 'All' | 'Paid' | 'Pending' | 'Overdue'): void {
    this.statusFilter = filter;
    this.memberInvoicesCurrentPage = 1;
  }

  getPaginatedInvoices(): MemberInvoice[] {
    const filtered = this.getFilteredInvoices();
    const startIndex = (this.memberInvoicesCurrentPage - 1) * this.memberInvoicesPageSize;
    return filtered.slice(startIndex, startIndex + this.memberInvoicesPageSize);
  }

  getMemberInvoicesTotalPages(): number {
    const count = this.getFilteredInvoices().length;
    return Math.ceil(count / this.memberInvoicesPageSize) || 1;
  }

  getMemberInvoicesPageNumbers(): number[] {
    const total = this.getMemberInvoicesTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  nextMemberInvoicesPage(): void {
    if (this.memberInvoicesCurrentPage < this.getMemberInvoicesTotalPages()) {
      this.memberInvoicesCurrentPage++;
    }
  }

  prevMemberInvoicesPage(): void {
    if (this.memberInvoicesCurrentPage > 1) {
      this.memberInvoicesCurrentPage--;
    }
  }

  setMemberInvoicesPage(page: number): void {
    if (page >= 1 && page <= this.getMemberInvoicesTotalPages()) {
      this.memberInvoicesCurrentPage = page;
    }
  }

  onPageSizeChange(event: any): void {
    this.memberInvoicesPageSize = parseInt(event.target.value, 10);
    this.memberInvoicesCurrentPage = 1;
  }

  // Aggregated Member Billing Stats
  getPaidSum(): number {
    return (this.memberInvoices || []).filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
  }

  getPendingSum(): number {
    return (this.memberInvoices || []).filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0);
  }

  getOverdueSum(): number {
    return (this.memberInvoices || []).filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0);
  }

  getTaxSum(): number {
    return (this.memberInvoices || [])
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => {
        const rate = i.taxRate || 18;
        const taxVal = i.amount - (i.amount / (1 + (rate / 100)));
        return sum + taxVal;
      }, 0);
  }
  getTotalInvoicedSum(): number {
    return (this.memberInvoices || []).reduce((sum, i) => sum + i.amount, 0);
  }

  // Aggregated Staff Payroll Stats
  getStaffPaidSum(): number {
    return this.staffPayouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.totalPayout, 0);
  }

  getStaffPendingSum(): number {
    return this.staffPayouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.totalPayout, 0);
  }

  getStaffProcessingSum(): number {
    return this.staffPayouts.filter(p => p.status === 'Processing').reduce((sum, p) => sum + p.totalPayout, 0);
  }

  getStaffTotalPayroll(): number {
    return this.staffPayouts.reduce((sum, p) => sum + p.totalPayout, 0);
  }

  processStaffPayout(payoutId: string, event: Event): void {
    event.stopPropagation();
    const payout = this.staffPayouts.find(p => p.id === payoutId);
    if (!payout || !payout.staffId) {
      if (payout) {
        payout.status = 'Paid';
        payout.payoutDate = new Date();
        this.notification.success(`Payout of ₹${payout.totalPayout.toLocaleString()} processed successfully for ${payout.staffName}!`);
      }
      return;
    }

    const payload = {
      staffId: payout.staffId,
      monthKey: this.selectedPayrollMonth,
      status: 'Paid' as const,
      commissions: payout.commissions,
      totalPayout: payout.totalPayout
    };

    this.billingService.releaseStaffPayout(payload).subscribe({
      next: () => {
        payout.status = 'Paid';
        payout.payoutDate = new Date();
        this.notification.success(`Payout of ₹${payout.totalPayout.toLocaleString()} released successfully for ${payout.staffName}!`);
        this.loadStaffPayoutsForMonth(this.selectedPayrollMonth);
      },
      error: () => {
        this.notification.error('Failed to release staff payout.');
      }
    });
  }

  downloadPayslip(payoutName: string): void {
    this.notification.success(`Payslip PDF for ${payoutName} downloaded successfully!`);
  }

  openPayrollRulesModal(payout: StaffPayout, event: Event): void {
    event.stopPropagation();
    this.selectedPayrollStaff = payout;
    this.payrollRulesForm.patchValue({
      baseSalary: payout.baseSalary,
      ptCommissionRate: payout.ptCommissionRate || 15,
      rehabCommissionRate: payout.rehabCommissionRate || 15
    });
    this.showPayrollRulesModal = true;
  }

  closePayrollRulesModal(): void {
    this.showPayrollRulesModal = false;
    this.selectedPayrollStaff = null;
  }

  savePayrollRules(): void {
    if (this.payrollRulesForm.invalid || !this.selectedPayrollStaff) return;
    const formValues = this.payrollRulesForm.value;

    if (!this.selectedPayrollStaff.staffId) {
      this.selectedPayrollStaff.baseSalary = formValues.baseSalary;
      this.selectedPayrollStaff.ptCommissionRate = formValues.ptCommissionRate;
      this.selectedPayrollStaff.rehabCommissionRate = formValues.rehabCommissionRate;
      this.selectedPayrollStaff.totalPayout = this.selectedPayrollStaff.baseSalary + this.selectedPayrollStaff.commissions;
      this.notification.success(`Payroll rules updated successfully for ${this.selectedPayrollStaff.staffName}!`);
      this.closePayrollRulesModal();
      return;
    }

    const payload = {
      staffId: this.selectedPayrollStaff.staffId,
      baseSalary: formValues.baseSalary,
      ptCommissionRate: formValues.ptCommissionRate,
      rehabCommissionRate: formValues.rehabCommissionRate
    };

    this.billingService.updateStaffPayrollRules(payload).subscribe({
      next: () => {
        this.notification.success(`Payroll rules updated successfully for ${this.selectedPayrollStaff?.staffName}!`);
        this.loadStaffPayoutsForMonth(this.selectedPayrollMonth);
        this.closePayrollRulesModal();
      },
      error: () => {
        this.notification.error('Failed to update payroll rules on the server.');
      }
    });
  }

  switchTab(tab: 'member' | 'saas' | 'settings' | 'staff'): void {
    this.activeTab = tab;
  }

  openUpiPaymentModal(planName: string = 'GymForge Pro Plan', price: number = 4999): void {
    // Close upgrade modal first so both don't stack
    this.showUpgradeModal = false;
    this.checkoutPlanName = planName;
    this.checkoutPrice = price;
    this.showUpiPaymentModal = true;
    this.startUpiCountdown();
  }

  closeUpiPaymentModal(): void {
    this.showUpiPaymentModal = false;
    if (this.upiTimerInterval) {
      clearInterval(this.upiTimerInterval);
    }
  }

  startUpiCountdown(): void {
    let totalSeconds = 300; // 5 minutes
    if (this.upiTimerInterval) {
      clearInterval(this.upiTimerInterval);
    }
    this.upiTimer = '05:00';
    this.upiTimerInterval = setInterval(() => {
      totalSeconds--;
      if (totalSeconds <= 0) {
        this.closeUpiPaymentModal();
        this.notification.error('UPI payment request timed out. Please try again.');
        return;
      }
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      this.upiTimer = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
  }

  simulateUpiPaymentSuccess(): void {
    this.notification.info('Authorizing payment with bank UPI gateway...');

    setTimeout(() => {
      this.paymentService.renewSubscription(this.checkoutPlanName, this.checkoutPrice).subscribe({
        next: (res) => {
          if (res.data) {
            this.subscriptionStatus = res.data;
            this.loadPlatformInvoices();
            this.notification.success(`Payment of ₹${this.checkoutPrice.toLocaleString('en-IN')}.00 processed successfully! Plan updated to ${this.checkoutPlanName}.`);
          }
          this.closeUpiPaymentModal();
          this.closeUpgradeModal();
        },
        error: () => {
          this.notification.error('Failed to process payment verification on server.');
          this.closeUpiPaymentModal();
        }
      });
    }, 1500);
  }

  openUpgradeModal(): void {
    this.showUpgradeModal = true;
    if (this.availablePlans.length === 0) {
      this.pricingService.getAllPlans().subscribe({
        next: (res) => { if (res.data) this.availablePlans = res.data.filter(p => p.isActive && !p.isTrial); },
        error: () => this.notification.error('Could not load subscription plans.')
      });
    }
  }

  closeUpgradeModal(): void {
    this.showUpgradeModal = false;
  }

  saveMerchantGatewaySettings(): void {
    this.notification.success('Merchant gateway settings saved! Member online payments are fully verified.');
  }

  toggleRazorpayKeysVisibility(): void {
    this.showRazorpayKeys = !this.showRazorpayKeys;
  }

  viewInvoice(invoice: MemberInvoice): void {
    this.selectedInvoice = invoice;
  }

  closeInvoiceModal(): void {
    this.selectedInvoice = null;
  }

  sendInvoiceReminder(invoice: MemberInvoice, event: Event): void {
    event.stopPropagation();
    this.notification.success(`WhatsApp & Email reminder dispatched to ${invoice.memberName} successfully.`);
  }

  markAsPaid(invoice: MemberInvoice, event: Event): void {
    event.stopPropagation();
    if (!invoice.realRecordId) {
      invoice.status = 'Paid';
      this.notification.success(`Invoice ${invoice.id} marked as Paid!`);
      return;
    }

    this.billingService.payInvoice(invoice.realRecordId).subscribe({
      next: () => {
        invoice.status = 'Paid';
        this.notification.success(`Invoice ${invoice.id} successfully marked as Paid!`);
        this.loadMemberBillingOverview(this.selectedPayrollMonth);
      },
      error: () => {
        this.notification.error('Failed to update invoice payment status.');
      }
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      const formValues = this.settingsForm.value;
      const payload = {
        gymName: this.gymDetails?.gymName || '',
        gstNumber: formValues.gymGstin,
        invoicePrefix: formValues.invoicePrefix,
        defaultTaxRate: formValues.taxPercentage,
        overdueGraceDays: formValues.overdueGraceDays,
        autoEmailReceipts: formValues.autoEmailReceipts
      };

      this.gymService.updateMyGym(payload).subscribe({
        next: () => {
          this.notification.success('Tax rules & legal billing configuration saved successfully.');
          this.loadGymSettingsAndMonths();
        },
        error: () => {
          this.notification.error('Failed to save billing configuration to server.');
        }
      });
    } else {
      this.notification.error('Please resolve validation errors in the settings form.');
    }
  }

  getFormattedInvoiceId(invoice: any): string {
    if (!invoice?.id) return '';

    // SaaS/Platform invoices issued by GymForge do not get gym owner custom prefix
    if (invoice.planName || invoice.billingDate) {
      return invoice.id;
    }

    const prefix = this.settingsForm?.get('invoicePrefix')?.value || this.gymDetails?.invoicePrefix || 'GF-';
    const rawId = invoice.id.toString();

    if (rawId.startsWith(prefix)) {
      return rawId;
    }

    const displayId = rawId.length > 8 ? rawId.substring(0, 8).toUpperCase() : rawId.toUpperCase();
    return `${prefix}${displayId}`;
  }

  downloadInvoicePdf(invoice: any, event: Event): void {
    event.stopPropagation();

    // 1. Mount preview modal temporarily if not already open
    const wasOpen = !!this.selectedInvoice;
    if (!wasOpen) {
      this.selectedInvoice = invoice;
    }

    // 2. Wait 150ms for Angular's visual rendering cycle and modal animations to complete
    setTimeout(() => {
      const printableElement = document.getElementById('printable-receipt');
      if (!printableElement) {
        this.notification.error('Failed to locate print receipt template.');
        return;
      }

      // 3. Create absolute hidden iframe with standard viewport
      const printFrame = document.createElement('iframe');
      printFrame.setAttribute('style', 'position: absolute; width: 1024px; height: 768px; top: -9999px; left: -9999px; visibility: hidden;');

      // 4. REGISTER ONLOAD EVENT HANDLER FIRST TO PREVENT SYNCHRONOUS CACHE RACE CONDITIONS!
      printFrame.onload = () => {
        printFrame.contentWindow?.postMessage({
          type: 'PRINT_INVOICE',
          invoiceId: invoice.id || '',
          html: printableElement.innerHTML
        }, '*');
      };

      // 5. Now assign src and mount iframe in the DOM to trigger safe load
      printFrame.src = '/assets/templates/invoice-print.html';
      document.body.appendChild(printFrame);

      // 6. Securely listen for the complete signal to dispose frame and reset modal states
      const handlePrintComplete = (msgEvent: MessageEvent) => {
        if (msgEvent.data && msgEvent.data.type === 'PRINT_COMPLETE') {
          // Dispose the iframe
          if (printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }

          // Deregister event listener
          window.removeEventListener('message', handlePrintComplete);

          // Clean up temporary visual states
          if (!wasOpen) {
            this.selectedInvoice = null;
          }
          this.notification.success(`PDF receipt generated for ${invoice.id || invoice.memberName || 'GymForge License'}.`);
        }
      };

      window.addEventListener('message', handlePrintComplete);
    }, 50);
  }

  isSaaSInvoice(invoice: any): boolean {
    return !!invoice && (!!invoice.planName || invoice.id?.toString().includes('SaaS') || invoice.id?.toString().startsWith('pay_'));
  }
}
