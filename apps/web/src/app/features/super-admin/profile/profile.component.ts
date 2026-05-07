import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../core/services/profile.service';
import { UserProfile } from '../../../shared/models/user-profile.model';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';
import { API_CONSTANTS } from '../../../core/constants/api-constants';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
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
  selectedFile: File | null = null;
  previewUrl: string | null = null;

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

  loadProfile(forceRefresh = false) {
    this.profileService.getProfile(forceRefresh).subscribe({
      next: (response: any) => {
        const data = response.data || response;

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
        this.selectedFile = null;
        this.previewUrl = null;
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

  async saveProfile() {
    if (this.profileForm.invalid) return;

    this.isSaving = true;

    try {
      // 1. If there's a new file, upload it first
      if (this.selectedFile) {
        const uploadRes = await this.profileService.uploadAvatar(this.selectedFile).toPromise();
        
        // Exhaustive check for the URL in the response (handling wrapping and casing)
        const newUrl = uploadRes?.data?.url || uploadRes?.data?.Url || 
                       uploadRes?.url || uploadRes?.Url;
        
        if (newUrl) {
          this.profileForm.patchValue({ profilePictureUrl: newUrl });
          // Force update local profile object so preview stays stable if needed
          if (this.profile) this.profile.profilePictureUrl = newUrl;
        }
      }

      // 2. Save the profile details
      this.profileService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.isSaving = false;
          this.isEditMode = false;
          this.selectedFile = null;
          this.previewUrl = null;
          this.notification.success(CONSTANTS.PROFILE_UPDATE_SUCCESS_MESSAGE);
          
          // Single final refresh to sync everything (including Header) - FORCE REFRESH HERE
          this.loadProfile(true);
        },
        error: (err) => {
          this.isSaving = false;
          this.notification.error(err.error?.message || CONSTANTS.PROFILE_UPDATE_ERROR_MESSAGE);
        }
      });
    } catch (error: any) {
      this.isSaving = false;
      this.notification.error(error.error?.message || CONSTANTS.PROFILE_PICTURE_UPLOAD_ERROR);
    }
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

  getImageUrl(path: string | undefined): string | null {
    if (this.previewUrl) return this.previewUrl;
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = API_CONSTANTS.BASE_URL.replace('/api', '');
    return `${baseUrl}${path}`;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  requestReset() {
    this.notification.success(CONSTANTS.AUTH.PASSWORD_RESET_LINK_SENT);
  }

  triggerAvatarUpload() {
    const fileInput = document.getElementById('avatarInput') as HTMLInputElement;
    fileInput?.click();
  }
}
