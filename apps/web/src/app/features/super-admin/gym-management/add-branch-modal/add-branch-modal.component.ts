import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../shared/constants/validation.constants';
import { phoneValidator, postalCodeValidator } from '../../../../shared/validators/custom-validators';
import { GymService } from '../../../../core/services/gym.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ValidationMessage } from '../../../../shared/components/validation-message/validation-message.component';
import { TimePickerComponent } from '../../../../shared/components/time-picker/time-picker.component';
import { CONSTANTS } from '../../../../core/constants/constants';

@Component({
  selector: 'app-add-branch-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ValidationMessage, TimePickerComponent],
  templateUrl: './add-branch-modal.component.html',
  styleUrl: './add-branch-modal.component.scss'
})
export class AddBranchModalComponent {
  readonly limits = FIELD_LIMITS;

  @Input() gymId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() branchAdded = new EventEmitter<void>();

  branchForm: FormGroup;
  isSubmitting = false;

  private fb = inject(FormBuilder);
  private gymService = inject(GymService);
  private notification = inject(NotificationService);

  constructor() {
    this.branchForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(FIELD_LIMITS.BRANCH_NAME)]],
      address: this.fb.group({
        line1: ['', [Validators.required, Validators.maxLength(FIELD_LIMITS.ADDRESS_LINE)]],
        line2: ['', [Validators.maxLength(FIELD_LIMITS.ADDRESS_LINE)]],
        city: ['', [Validators.required, Validators.maxLength(FIELD_LIMITS.CITY)]],
        state: ['', [Validators.required, Validators.maxLength(FIELD_LIMITS.STATE)]],
        country: ['', [Validators.required, Validators.maxLength(FIELD_LIMITS.COUNTRY)]],
        postalCode: ['', [Validators.required, Validators.maxLength(FIELD_LIMITS.POSTAL_CODE), postalCodeValidator]]
      }),
      contactNumber: ['', [Validators.required, Validators.maxLength(FIELD_LIMITS.PHONE), phoneValidator]],
      openTime: ['06:00'],
      closeTime: ['22:00']
    });
  }

  submit() {
    if (this.branchForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.gymService.addGymBranch(this.gymId, this.branchForm.value).subscribe({
      next: () => {
        this.notification.success(CONSTANTS.GYM_MODULE.BRANCH_ADD_SUCCESS);
        this.branchAdded.emit();
        this.isSubmitting = false;
        this.close.emit();
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Failed to add branch');
        this.isSubmitting = false;
      }
    });
  }
}
