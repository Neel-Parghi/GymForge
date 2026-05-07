import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GymService } from '../../../../core/services/gym.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ValidationMessage } from '../../../../shared/components/validation-message/validation-message.component';
import { CONSTANTS } from '../../../../core/constants/constants';

@Component({
  selector: 'app-add-branch-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ValidationMessage],
  templateUrl: './add-branch-modal.component.html',
  styleUrl: './add-branch-modal.component.scss'
})
export class AddBranchModalComponent {
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
      name: ['', Validators.required],
      address: this.fb.group({
        line1: ['', Validators.required],
        line2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        postalCode: ['', Validators.required]
      }),
      contactNumber: ['', Validators.required],
      openTime: ['06:00'],
      closeTime: ['22:00']
    });
  }

  submit() {
    if (this.branchForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.gymService.addGymBranch(this.gymId, this.branchForm.value).subscribe({
      next: () => {
        this.notification.success('Branch added successfully!');
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
