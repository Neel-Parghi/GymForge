import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserService } from '../../../../../core/services/user.service';
import { ConfirmationPopupComponent } from "../../../../../shared/components/confirmation-popup-component/confirmation-popup-component";
import { ValidationMessage } from '../../../../../shared/components/validation-message/validation-message';

@Component({
  selector: 'app-add-owner-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationPopupComponent, ValidationMessage],
  templateUrl: './add-owner-modal.component.html',
  styleUrl: './add-owner-modal.component.scss'
})
export class AddOwnerModalComponent implements OnInit {
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
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]]
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
          this.notification.success('Invitation sent successfully!');
          this.ownerInvited.emit();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Failed to send invitation');
          this.isSubmitting = false;
        }
      });
    }
  }
}
