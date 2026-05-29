import { Component, EventEmitter, Output, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { CONSTANTS } from '../../../../core/constants/constants';
import { StaffService } from '../../../../core/services/staff.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { ConfirmationPopupComponent } from "../../../../shared/components/confirmation-popup/confirmation-popup.component";
import { ValidationMessage } from '../../../../shared/components/validation-message/validation-message.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { BranchContextService } from '../../../../core/services/branch-context.service';
import { DropdownOption } from '../../../../shared/models/dropdown.model';

@Component({
  selector: 'app-onboard-staff-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationPopupComponent, ValidationMessage, DropdownComponent],
  templateUrl: './onboard-staff-modal.component.html',
  styleUrl: './onboard-staff-modal.component.scss'
})
export class OnboardStaffModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() staffOnboarded = new EventEmitter<void>();

  @Input() isEdit = false;
  @Input() staff: any = null;
  @Input() branches: any[] = [];

  onboardForm!: FormGroup;
  isSubmitting = false;
  isConfirmCancelOpen = false;
  isGymOwner = false;

  private fb = inject(FormBuilder);
  private staffService = inject(StaffService);
  private authService = inject(AuthApiService);
  private notification = inject(NotificationService);
  private branchContextService = inject(BranchContextService);

  roles = [
    { value: 1, label: 'Trainer' },
    { value: 2, label: 'Receptionist' },
    { value: 3, label: 'Manager' },
    { value: 4, label: 'Cleaner' },
    { value: 5, label: 'Yoga Instructor' },
    { value: 6, label: 'Zumba Instructor' },
  ];

  ngOnInit(): void {
    this.isGymOwner = this.authService.getUserRole() === 'GymOwner';
    const defaultBranchId = this.isEdit
      ? (this.staff?.branchId || '')
      : (this.branchContextService.getActiveBranchId() || '');

    this.onboardForm = this.fb.group({
      firstName: [this.staff?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [this.staff?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [this.staff?.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.staff?.phoneNumber || '', [Validators.required]],
      role: [this.staff?.role || 1, [Validators.required]],
      branchId: [defaultBranchId],
      experienceYears: [this.staff?.experienceYears || 0, [Validators.min(0), Validators.max(60)]],
      bio: [this.staff?.bio || '', [Validators.maxLength(500)]],
      specializations: [this.staff?.specializations?.join(', ') || ''],
      shiftTimings: [this.staff?.shiftTimings || ''],
      instagramUrl: [this.staff?.instagramUrl || ''],
      portfolioUrl: [this.staff?.portfolioUrl || '']
    });
  }

  closeModal() {
    this.close.emit();
  }

  onTopClose() {
    if (this.onboardForm.dirty) {
      this.isConfirmCancelOpen = true;
    } else {
      this.closeModal();
    }
  }

  submit() {
    if (this.onboardForm.valid && !this.isSubmitting) {
      const gymId = this.authService.getGymId();
      if (!gymId) {
        this.notification.error(CONSTANTS.STAFF_MODULE.SESSION_EXPIRED);
        return;
      }

      this.isSubmitting = true;

      const formValue = { ...this.onboardForm.value };
      if (formValue.specializations) {
        formValue.specializations = formValue.specializations.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
      } else {
        formValue.specializations = [];
      }

      if (!formValue.branchId) {
        formValue.branchId = null;
      }

      const request = this.isEdit
        ? this.staffService.updateStaff(this.staff.id, formValue)
        : this.staffService.addStaff(formValue);

      request.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Staff profile updated!' : 'Staff invitation sent successfully!');
          this.staffOnboarded.emit();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.notification.error(err.error?.message || `Failed to ${this.isEdit ? 'update' : 'add'} staff.`);
          this.isSubmitting = false;
        }
      });
    }
  }

  get branchOptions(): DropdownOption[] {
    const options: DropdownOption[] = [{ label: 'No Branch (General)', value: '' }];
    this.branches.forEach(b => options.push({ label: b.name, value: b.id }));
    return options;
  }
}
