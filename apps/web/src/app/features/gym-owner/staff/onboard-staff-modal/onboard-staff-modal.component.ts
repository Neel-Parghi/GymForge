import { Component, EventEmitter, Output, Input, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
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

    let defaultStart = '08:00';
    let defaultEnd = '20:00';
    if (this.staff?.shiftTimings) {
      const parts = this.staff.shiftTimings.split('-');
      if (parts.length === 2) {
        defaultStart = this.parseFrom12Hour(parts[0].trim());
        defaultEnd = this.parseFrom12Hour(parts[1].trim());
      }
    }

    this.onboardForm = this.fb.group({
      firstName: [this.staff?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [this.staff?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [this.staff?.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.staff?.phoneNumber || '', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      role: [this.staff?.role || 1, [Validators.required]],
      branchId: [defaultBranchId],
      experienceYears: [this.staff?.experienceYears || 0, [Validators.min(0), Validators.max(80)]],
      bio: [this.staff?.bio || '', [Validators.maxLength(300)]],
      specializations: [this.staff?.specializations?.join(', ') || ''],
      shiftStartTime: [defaultStart],
      shiftEndTime: [defaultEnd],
      instagramUrl: [this.staff?.instagramUrl || '', [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i)]],
      portfolioUrl: [this.staff?.portfolioUrl || '', [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i)]]
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

  submit(sendInvitation: boolean = true) {
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

      let formattedShift = '';
      if (formValue.shiftStartTime && formValue.shiftEndTime) {
        formattedShift = `${this.formatTo12Hour(formValue.shiftStartTime)} - ${this.formatTo12Hour(formValue.shiftEndTime)}`;
      }
      formValue.shiftTimings = formattedShift;
      formValue.sendInvitation = sendInvitation;

      delete formValue.shiftStartTime;
      delete formValue.shiftEndTime;

      const request = (this.isEdit
        ? this.staffService.updateStaff(this.staff.id, formValue)
        : this.staffService.addStaff(formValue)) as Observable<any>;

      request.subscribe({
        next: () => {
          const successMsg = this.isEdit ? 'Staff profile updated!' : (sendInvitation ? 'Staff invitation sent successfully!' : 'Staff added successfully!');
          this.notification.success(successMsg);
          this.staffOnboarded.emit();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err: any) => {
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

  private parseFrom12Hour(timeStr: string): string {
    if (!timeStr) return '';
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    return '';
  }

  private formatTo12Hour(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
  }
}
