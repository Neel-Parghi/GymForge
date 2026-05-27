import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';
import { BillingService } from '../../../../../core/services/billing.service';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';

@Component({
  selector: 'app-create-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './create-invoice-modal.component.html',
  styleUrl: './create-invoice-modal.component.scss'
})
export class CreateInvoiceModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private billingService = inject(BillingService);

  @Input() gymMembers: any[] = [];
  @Input() memberDropdownOptions: DropdownOption[] = [];
  @Input() categoryDropdownOptions: DropdownOption[] = [];
  @Input() statusDropdownOptions: DropdownOption[] = [];
  @Input() prefillData?: any;

  @Output() close = new EventEmitter<void>();
  @Output() invoiceCreated = new EventEmitter<void>();

  createInvoiceForm!: FormGroup;

  ngOnInit(): void {
    this.initCustomInvoiceForm();
  }

  initCustomInvoiceForm(): void {
    this.createInvoiceForm = this.fb.group({
      memberIndex: [this.prefillData?.memberIndex ?? 0, Validators.required],
      type: [this.prefillData?.type ?? 'Personal Training', Validators.required],
      itemName: [this.prefillData?.itemName ?? '', [Validators.required, Validators.minLength(3)]],
      amount: [this.prefillData ? this.prefillData.amount : 1000, [Validators.required, Validators.min(1)]],
      status: [this.prefillData?.status ?? 'Pending', Validators.required]
    });
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
        this.invoiceCreated.emit();
        this.close.emit();
      },
      error: () => {
        this.notification.error('Failed to register custom invoice.');
      }
    });
  }
}
