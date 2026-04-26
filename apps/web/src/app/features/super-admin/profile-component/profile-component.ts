import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../core/services/profile.service';
import { UserProfile } from '../../../shared/models/user-profile.model';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile-component.html',
  styleUrls: ['./profile-component.scss']
})
export class ProfileComponent implements OnInit {
  profile?: UserProfile;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isEditMode = false;
  isSaving = false;
  isChangingPassword = false;
  passwordChangeSuccess = false;
  passwordChangeError = '';
  activeTab: 'personal' | 'security' = 'personal';
  activeSecuritySubTab: 'change' | 'reset' = 'change';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private notification: NotificationService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      profilePictureUrl: [''],
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      zipCode: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        const data = response.data || response.Data || response;

        this.profile = data;
        this.profileForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          profilePictureUrl: data.profilePictureUrl,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        });
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.loadProfile();
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditMode = false;
        this.notification.success(CONSTANTS.COMMON_UPDATE_SUCCESS_MESSAGE);
        this.loadProfile();
      },
      error: (err) => {
        this.isSaving = false;
        this.notification.error(err.error?.message || CONSTANTS.COMMON_UPDATE_ERROR_MESSAGE);
      }
    });
  }

  submitPasswordChange() {
    if (this.passwordForm.invalid) return;

    this.isChangingPassword = true;
    this.passwordChangeError = '';
    this.passwordChangeSuccess = false;

    setTimeout(() => {
      this.isChangingPassword = false;
      this.passwordChangeSuccess = true;
      this.passwordForm.reset();

      setTimeout(() => this.passwordChangeSuccess = false, 3000);
    }, 1000);
  }

  requestReset() {
    this.notification.success('Password reset link has been sent to your email.');
  }

  triggerAvatarUpload() {
    this.notification.info('Profile picture upload coming soon!');
  }
}
