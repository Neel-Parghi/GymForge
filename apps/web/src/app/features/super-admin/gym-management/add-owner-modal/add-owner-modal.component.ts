import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../shared/constants/validation.constants';
import { phoneValidator } from '../../../../shared/validators/custom-validators';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserService } from '../../../../core/services/user.service';
import { ConfirmationPopupComponent } from "../../../../shared/components/confirmation-popup/confirmation-popup.component";
import { ValidationMessage } from '../../../../shared/components/validation-message/validation-message.component';
import { CONSTANTS } from '../../../../core/constants/constants';

@Component({
  selector: 'app-add-owner-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationPopupComponent, ValidationMessage],
  templateUrl: './add-owner-modal.component.html',
  styleUrl: './add-owner-modal.component.scss'
})
export class AddOwnerModalComponent implements OnInit {
  readonly limits = FIELD_LIMITS;

  @Output() close = new EventEmitter<void>();
  @Output() ownerInvited = new EventEmitter<void>();

  inviteForm!: FormGroup;
  isSubmitting = false;
  isConfirmCancelOpen = false;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    this.inviteForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(FIELD_LIMITS.PERSON_NAME)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(FIELD_LIMITS.PERSON_NAME)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(FIELD_LIMITS.EMAIL)]],
      phone: ['', [Validators.required, Validators.maxLength(FIELD_LIMITS.PHONE), phoneValidator]]
    });
  }

  closeModal() {
    this.close.emit();
  }

  onTopClose() {
    if (this.inviteForm.dirty) {
      this.isConfirmCancelOpen = true;
    } else {
      this.closeModal();
    }
  }

  submit() {
    if (this.inviteForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.userService.inviteOwner(this.inviteForm.value).subscribe({
        next: () => {
          this.notification.success(CONSTANTS.GYM_INVITE_SUCCESS_MESSAGE);
          this.ownerInvited.emit();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.notification.error(err.error?.message || CONSTANTS.GYM_INVITE_ERROR_MESSAGE);
          this.isSubmitting = false;
        }
      });
    }
  }
}
