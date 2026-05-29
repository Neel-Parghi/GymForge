import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CONSTANTS } from '../../../../../core/constants/constants';
import { BillingService } from '../../../../../core/services/billing.service';
import { StaffPayout } from '../../../../../shared/models/payment.model';

@Component({
  selector: 'app-payroll-rules-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payroll-rules-modal.component.html',
  styleUrl: './payroll-rules-modal.component.scss'
})
export class PayrollRulesModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private billingService = inject(BillingService);

  @Input() selectedPayrollStaff!: StaffPayout;
  @Input() selectedPayrollMonth: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() rulesSaved = new EventEmitter<void>();

  payrollRulesForm!: FormGroup;

  ngOnInit(): void {
    this.initPayrollRulesForm();
  }

  initPayrollRulesForm(): void {
    this.payrollRulesForm = this.fb.group({
      baseSalary: [this.selectedPayrollStaff?.baseSalary || 0, [Validators.required, Validators.min(0)]],
      ptCommissionRate: [this.selectedPayrollStaff?.ptCommissionRate || 15, [Validators.required, Validators.min(0), Validators.max(100)]],
      rehabCommissionRate: [this.selectedPayrollStaff?.rehabCommissionRate || 15, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  savePayrollRules(): void {
    if (this.payrollRulesForm.invalid || !this.selectedPayrollStaff) return;
    const formValues = this.payrollRulesForm.value;

    if (!this.selectedPayrollStaff.staffId) {
      this.selectedPayrollStaff.baseSalary = formValues.baseSalary;
      this.selectedPayrollStaff.ptCommissionRate = formValues.ptCommissionRate;
      this.selectedPayrollStaff.rehabCommissionRate = formValues.rehabCommissionRate;
      this.selectedPayrollStaff.totalPayout = this.selectedPayrollStaff.baseSalary + this.selectedPayrollStaff.commissions;
      this.notification.success(CONSTANTS.BILLING_MODULE.PAYROLL_RULES_SUCCESS.replace('{name}', this.selectedPayrollStaff.staffName));
      this.rulesSaved.emit();
      this.close.emit();
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
        this.notification.success(CONSTANTS.BILLING_MODULE.PAYROLL_RULES_SUCCESS.replace('{name}', this.selectedPayrollStaff?.staffName || 'Staff'));
        this.rulesSaved.emit();
        this.close.emit();
      },
      error: () => {
        this.notification.error(CONSTANTS.BILLING_MODULE.PAYROLL_RULES_ERROR);
      }
    });
  }
}
