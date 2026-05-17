import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GymService } from '../../../core/services/gym.service';
import { NotificationService } from '../../../core/services/notification.service';
import { GymListResponse } from '../../../shared/models/gym.model';

@Component({
  selector: 'app-my-gyms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-gyms.component.html',
  styleUrl: './my-gyms.component.scss',
})
export class MyGymsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gymService = inject(GymService);
  private toastService = inject(NotificationService);

  activeTab: 'profile' | 'branches' | 'plan' = 'profile';

  profileForm!: FormGroup;
  branchForm!: FormGroup;
  isBranchModalOpen = false;
  isSavingBranch = false;
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  gymData: GymListResponse | null = null;
  branches: any[] = [];
  isLoadingBranches = false;

  ngOnInit(): void {
    this.initForm();
    this.loadGymData();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      gymName: ['', [Validators.required]],
      brandName: [''],
      email: ['', [Validators.email]],
      phone: [''],
      websiteUrl: [''],
      description: [''],
      gstNumber: [''],
      registrationNumber: [''],
    });
    this.profileForm.disable();

    this.branchForm = this.fb.group({
      name: ['', Validators.required],
      contactNumber: [''],
      openTime: [''],
      closeTime: [''],
      address: this.fb.group({
        line1: ['', Validators.required],
        line2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['India'],
        postalCode: ['', Validators.required]
      })
    });
  }

  toggleEditMode(): void {
    this.isEditMode = true;
    this.profileForm.enable();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.profileForm.disable();
    if (this.gymData) {
      this.profileForm.patchValue(this.gymData);
    }
  }

  onLogoChange(event: Event): void {
    if (!this.isEditMode) return;
    this.toastService.info('Logo upload functionality will be integrated with cloud storage soon.');
  }

  private loadGymData(): void {
    this.isLoading = true;
    this.gymService.getMyGym().subscribe({
      next: (res) => {
        if (res.data) {
          this.gymData = res.data;
          this.profileForm.patchValue(res.data);
          if (this.gymData.id) {
            this.loadBranches(this.gymData.id);
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load gym details');
        this.isLoading = false;
      }
    });
  }

  private loadBranches(gymId: string): void {
    this.isLoadingBranches = true;
    this.gymService.getMyBranches().subscribe({
      next: (res) => {
        this.branches = res.data || [];
        this.isLoadingBranches = false;
      },
      error: () => {
        this.toastService.error('Failed to load branches');
        this.isLoadingBranches = false;
      }
    });
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.gymService.updateMyGym(this.profileForm.value).subscribe({
      next: () => {
        this.toastService.success('Gym profile updated successfully');
        this.isSaving = false;
        this.isEditMode = false;
        this.profileForm.disable();

        if (this.gymData) {
          this.gymData = { ...this.gymData, ...this.profileForm.value };
        }
      },
      error: () => {
        this.toastService.error('Failed to update gym profile');
        this.isSaving = false;
      }
    });
  }

  openBranchModal(branch: any = null): void {
    if (branch) {
      this.toastService.info('Branch editing coming soon');
      return;
    } else {
      this.branchForm.reset({ address: { country: 'India' } });
    }
    this.isBranchModalOpen = true;
  }

  closeBranchModal(): void {
    this.isBranchModalOpen = false;
  }

  onSubmitBranch(): void {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    this.isSavingBranch = true;
    this.gymService.addMyBranch(this.branchForm.value).subscribe({
      next: () => {
        this.toastService.success('Branch added successfully');
        this.isSavingBranch = false;
        this.isBranchModalOpen = false;
        if (this.gymData?.id) {
          this.loadBranches(this.gymData.id);
        }
      },
      error: () => {
        this.toastService.error('Failed to add branch');
        this.isSavingBranch = false;
      }
    });
  }

  editBranch(branch: any): void {
    this.openBranchModal(branch);
  }

  addBranch(): void {
    this.openBranchModal();
  }
}
