import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CONSTANTS } from '../../../../../core/constants/constants';
import { BillingService } from '../../../../../core/services/billing.service';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';
import { MemberInvoice } from '../../../../../shared/models/payment.model';
import { PaymentRecordDto } from '../../../../../shared/models/member-invoice.model';

@Component({
  selector: 'app-record-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './record-payment-modal.component.html',
  styleUrl: './record-payment-modal.component.scss'
})
export class RecordPaymentModalComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private billingService = inject(BillingService);

  @Input() invoice!: MemberInvoice;

  @Output() close = new EventEmitter<void>();
  @Output() paymentRecorded = new EventEmitter<void>();

  recordPaymentForm!: FormGroup;
  paymentHistory: PaymentRecordDto[] = [];
  isSubmitting = false;

  paymentMethodOptions: DropdownOption[] = [
    { label: 'UPI', value: 'UPI' },
    { label: 'Cash', value: 'CASH' },
    { label: 'Card', value: 'CARD' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' }
  ];

  get balance(): number {
    return this.invoice?.balance ?? this.invoice?.amount ?? 0;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadPaymentHistory();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoice'] && !changes['invoice'].firstChange) {
      this.initForm();
      this.loadPaymentHistory();
    }
  }

  initForm(): void {
    this.recordPaymentForm = this.fb.group({
      amount: [this.balance, [Validators.required, Validators.min(0.01), Validators.max(this.balance)]],
      paymentMethod: ['UPI', Validators.required],
      notes: ['']
    });
  }

  loadPaymentHistory(): void {
    if (!this.invoice?.realRecordId) {
      this.paymentHistory = [];
      return;
    }
    this.billingService.getPaymentHistory(this.invoice.realRecordId).subscribe({
      next: (res) => {
        this.paymentHistory = res?.data || [];
      },
      error: () => {
        this.paymentHistory = [];
      }
    });
  }

  submitPayment(): void {
    if (this.recordPaymentForm.invalid) {
      this.notification.error(CONSTANTS.BILLING_MODULE.RECORD_PAYMENT_VALIDATION_ERROR);
      return;
    }

    if (!this.invoice?.realRecordId) {
      this.notification.error(CONSTANTS.BILLING_MODULE.RECORD_PAYMENT_ERROR);
      return;
    }

    const val = this.recordPaymentForm.value;
    this.isSubmitting = true;

    this.billingService.recordPayment(this.invoice.realRecordId, {
      amount: val.amount,
      paymentMethod: val.paymentMethod,
      notes: val.notes || null
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notification.success(CONSTANTS.BILLING_MODULE.RECORD_PAYMENT_SUCCESS.replace('{id}', this.invoice.id));
        this.paymentRecorded.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        const serverMessage = err?.error?.message;
        this.notification.error(serverMessage || CONSTANTS.BILLING_MODULE.RECORD_PAYMENT_ERROR);
      }
    });
  }
}
