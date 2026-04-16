import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PricingService } from '../../../../core/services/pricing.service';

@Component({
  selector: 'app-add-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-pricing.html',
  styleUrl: './add-pricing.scss',
})
export class AddPricing {
  @Output() close = new EventEmitter<void>();
  @Output() planAdded = new EventEmitter<any>();

  pricingForm: FormGroup;
  isSubmitting = false;

  private fb = inject(FormBuilder);
  private pricingService = inject(PricingService);

  constructor() {
    this.pricingForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      durationInDays: [30, [Validators.required, Validators.min(1)]],
      maxBranches: [null],
      maxMembers: [null],
      isTrial: [false],
      isActive: [true]
    });
  }

  onSubmit() {
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = this.pricingForm.value;

    this.pricingService.addPlan(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.planAdded.emit(res);
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}
