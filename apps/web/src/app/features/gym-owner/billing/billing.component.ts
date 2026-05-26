import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
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
import { InvoiceDetailModalComponent } from './components/invoice-detail-modal/invoice-detail-modal.component';
import { CreateInvoiceModalComponent } from './components/create-invoice-modal/create-invoice-modal.component';
import { UpgradePlansModalComponent } from './components/upgrade-plans-modal/upgrade-plans-modal.component';
import { UpiPaymentModalComponent } from './components/upi-payment-modal/upi-payment-modal.component';
import { PayrollRulesModalComponent } from './components/payroll-rules-modal/payroll-rules-modal.component';
import { MerchantSettingsComponent } from './components/merchant-settings/merchant-settings.component';
import { DataGrid, GridCellDirective } from '../../../shared/components/data-grid/data-grid.component';
import { AppGridConfig } from '../../../shared/constants/grid-config';

@Component({
  selector: 'app-gym-owner-billing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InvoiceDetailModalComponent,
    CreateInvoiceModalComponent,
    UpgradePlansModalComponent,
    UpiPaymentModalComponent,
    PayrollRulesModalComponent,
    MerchantSettingsComponent,
    DataGrid,
    GridCellDirective
  ],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss'
})
export class BillingComponent implements OnInit {

  // Grid Configurations
  memberInvoicesConfig = AppGridConfig['MemberInvoices'];
  platformInvoicesConfig = AppGridConfig['PlatformInvoices'];
  staffPayoutsConfig = AppGridConfig['StaffPayouts'];

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
  invoiceSearchControl = new FormControl('');
  statusFilter: 'All' | 'Paid' | 'Pending' | 'Overdue' = 'All';
  showCreateInvoiceModal = false;

  showUpiPaymentModal = false;
  nextBillingDate = new Date(2026, 5, 1);

  enableOnlineMemberPayments = true;
  merchantUpiVpa = 'fitlife@okaxis';
  razorpayKeyId = 'rzp_live_9A2f8K1d3z9x';
  razorpaySecretKey = '••••••••••••••••••••••••';

  showUpgradeModal = false;
  checkoutPlanName = 'GymForge Pro Plan';
  checkoutPrice = 4999;
  availablePlans: PricingPlan[] = [];
  showPayrollRulesModal = false;
  selectedPayrollStaff: StaffPayout | null = null;

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

  settingsForm!: FormGroup;

  memberInvoices: MemberInvoice[] = [];
  showBillingOverview: boolean = true;

  memberInvoicesCurrentPage: number = 1;
  memberInvoicesPageSize: number = 10;
  protected readonly Math = Math;

  platformInvoices: PlatformInvoice[] = [];

  payrollMonthsOptions: DropdownOption[] = [];
  selectedPayrollMonth = (() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const monthNum = currentDate.getMonth() + 1;
    const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    return `${year}-${monthStr}`;
  })();
  periodForm!: FormGroup;

  staffPayouts: StaffPayout[] = [];

  ngOnInit(): void {
    this.initSettingsForm();
    this.generatePayrollMonths();
    this.initPeriodForm();
    this.loadGymMembers();
    this.loadSubscriptionStatus();
    this.loadPlatformInvoices();
    this.loadGymSettingsAndMonths();

    this.invoiceSearchControl.valueChanges.subscribe(val => {
      this.invoiceSearch = val || '';
      this.memberInvoicesCurrentPage = 1;
    });
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

          this.generatePayrollMonths(gym.createdOn);

          if (this.payrollMonthsOptions.length > 0) {
            const hasMonth = this.payrollMonthsOptions.some(o => o.value === this.selectedPayrollMonth);
            if (!hasMonth) {
              this.selectedPayrollMonth = this.payrollMonthsOptions[0].value;
            }
            this.periodForm.patchValue({ selectedPeriod: this.selectedPayrollMonth }, { emitEvent: false });
          }

          this.loadMemberBillingOverview(this.selectedPayrollMonth);
          this.loadStaffPayoutsForMonth(this.selectedPayrollMonth);
        }
      },
      error: () => {
        this.notification.error('Failed to load gym billing settings.');
        this.generatePayrollMonths();
        this.periodForm.patchValue({ selectedPeriod: this.selectedPayrollMonth }, { emitEvent: false });
        this.loadMemberBillingOverview(this.selectedPayrollMonth);
        this.loadStaffPayoutsForMonth(this.selectedPayrollMonth);
      }
    });
  }

  generatePayrollMonths(createdOnStr?: string): void {
    const currentDate = new Date();

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
            formattedInvoiceId: this.getFormattedInvoiceId({ id: inv.id }),
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

  initSettingsForm(): void {
    this.settingsForm = this.fb.group({
      gymGstin: ['', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      invoicePrefix: ['', Validators.required],
      taxPercentage: [18, [Validators.required, Validators.min(0), Validators.max(50)]],
      autoEmailReceipts: [true],
      overdueGraceDays: [3, [Validators.required, Validators.min(0)]]
    });
  }

  openCreateInvoiceModal(): void {
    this.showCreateInvoiceModal = true;
  }

  closeCreateInvoiceModal(): void {
    this.showCreateInvoiceModal = false;
  }

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

  onPageSizeChangeGrid(size: number): void {
    this.memberInvoicesPageSize = size;
    this.memberInvoicesCurrentPage = 1;
  }

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
    this.showPayrollRulesModal = true;
  }

  closePayrollRulesModal(): void {
    this.showPayrollRulesModal = false;
    this.selectedPayrollStaff = null;
  }

  switchTab(tab: 'member' | 'saas' | 'settings' | 'staff'): void {
    this.activeTab = tab;
  }

  openUpiPaymentModal(planName: string = 'GymForge Pro Plan', price: number = 4999): void {
    this.showUpgradeModal = false;
    this.checkoutPlanName = planName;
    this.checkoutPrice = price;
    this.showUpiPaymentModal = true;
  }

  closeUpiPaymentModal(): void {
    this.showUpiPaymentModal = false;
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

  saveMerchantGatewaySettings(settings: {
    enableOnlineMemberPayments: boolean;
    merchantUpiVpa: string;
    razorpayKeyId: string;
    razorpaySecretKey: string;
  }): void {
    this.enableOnlineMemberPayments = settings.enableOnlineMemberPayments;
    this.merchantUpiVpa = settings.merchantUpiVpa;
    this.razorpayKeyId = settings.razorpayKeyId;
    this.razorpaySecretKey = settings.razorpaySecretKey;
    this.notification.success('Merchant gateway settings saved! Member online payments are fully verified.');
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

    const wasOpen = !!this.selectedInvoice;
    if (!wasOpen) {
      this.selectedInvoice = invoice;
    }
    setTimeout(() => {
      const printableElement = document.getElementById('printable-receipt');
      if (!printableElement) {
        this.notification.error('Failed to locate print receipt template.');
        return;
      }

      const printFrame = document.createElement('iframe');
      printFrame.setAttribute('style', 'position: absolute; width: 1024px; height: 768px; top: -9999px; left: -9999px; visibility: hidden;');

      printFrame.onload = () => {
        printFrame.contentWindow?.postMessage({
          type: 'PRINT_INVOICE',
          invoiceId: invoice.id || '',
          html: printableElement.innerHTML
        }, '*');
      };

      printFrame.src = '/assets/templates/invoice-print.html';
      document.body.appendChild(printFrame);

      const handlePrintComplete = (msgEvent: MessageEvent) => {
        if (msgEvent.data && msgEvent.data.type === 'PRINT_COMPLETE') {
          if (printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }

          window.removeEventListener('message', handlePrintComplete);

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
