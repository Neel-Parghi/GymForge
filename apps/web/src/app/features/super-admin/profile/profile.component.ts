import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../core/services/profile.service';
import { StaffService } from '../../../core/services/staff.service';
import { UserProfile } from '../../../shared/models/user-profile.model';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';
import { API_CONSTANTS } from '../../../core/constants/api-constants';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
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

  isTrainer = false;
  specInput = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private staffService: StaffService,
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
      zipCode: [''],
      bio: [''],
      experienceYears: [0],
      instagramUrl: [''],
      portfolioUrl: [''],
      shiftTimings: [''],
      specializations: [[]]
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
        this.isTrainer = data.role === 'Trainer';

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

        if (this.isTrainer) {
          this.staffService.getStaffById(data.id).subscribe({
            next: (res: any) => {
              if (res?.data) {
                this.profileForm.patchValue({
                  bio: res.data.bio || '',
                  experienceYears: res.data.experienceYears || 0,
                  instagramUrl: res.data.instagramUrl || '',
                  portfolioUrl: res.data.portfolioUrl || '',
                  shiftTimings: res.data.shiftTimings || '',
                  specializations: res.data.specializations || []
                });
              }
            },
            error: (err) => console.error('Failed to load trainer details', err)
          });
        }

        this.selectedFile = null;
        this.previewUrl = null;
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  addSpecialization(): void {
    const val = this.specInput.trim();
    const specs = this.profileForm.get('specializations')?.value || [];
    if (val && !specs.includes(val)) {
      specs.push(val);
      this.profileForm.patchValue({ specializations: specs });
      this.specInput = '';
    }
  }

  removeSpecialization(index: number): void {
    const specs = this.profileForm.get('specializations')?.value || [];
    specs.splice(index, 1);
    this.profileForm.patchValue({ specializations: specs });
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
      await this.profileService.updateProfile(this.profileForm.value).toPromise();

      // 3. Save the staff details if trainer
      if (this.isTrainer && this.profile?.id) {
        const staffPayload = {
          firstName: this.profileForm.value.firstName,
          lastName: this.profileForm.value.lastName,
          email: this.profile?.email || '',
          phoneNumber: this.profileForm.value.phone,
          role: (this.profile as any).roleId || 1,
          branchId: (this.profile as any).branchId || undefined,
          bio: this.profileForm.value.bio,
          experienceYears: this.profileForm.value.experienceYears,
          instagramUrl: this.profileForm.value.instagramUrl,
          portfolioUrl: this.profileForm.value.portfolioUrl,
          shiftTimings: this.profileForm.value.shiftTimings,
          specializations: this.profileForm.value.specializations
        };
        await this.staffService.updateStaff(this.profile.id, staffPayload).toPromise();
      }

      this.isSaving = false;
      this.isEditMode = false;
      this.selectedFile = null;
      this.previewUrl = null;
      this.notification.success(CONSTANTS.PROFILE_UPDATE_SUCCESS_MESSAGE);
      
      // Single final refresh to sync everything (including Header) - FORCE REFRESH HERE
      this.loadProfile(true);
    } catch (error: any) {
      this.isSaving = false;
      this.notification.error(error.error?.message || CONSTANTS.PROFILE_UPDATE_ERROR_MESSAGE);
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
