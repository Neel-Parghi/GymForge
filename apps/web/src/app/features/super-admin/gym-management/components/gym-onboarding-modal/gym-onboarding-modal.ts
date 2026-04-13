import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GymService } from '../../../../../core/services/gym.service';

@Component({
  selector: 'app-gym-onboarding-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gym-onboarding-modal.html',
  styleUrl: './gym-onboarding-modal.scss'
})
export class GymOnboardingModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  currentStep = 1;
  totalSteps = 5;
  collapsedBranches: boolean[] = [];

  onboardingForm!: FormGroup;
  isSubmitting = false;
  isConfirmCancelOpen = false;

  private fb = inject(FormBuilder);
  private gymService = inject(GymService);
  private toastr = inject(ToastrService);

  steps = [
    { id: 1, label: 'Gym Info', key: 'gymInfo' },
    { id: 2, label: 'Branches', key: 'branches' },
    { id: 3, label: 'Assign Owner', key: 'assignedOwnerId' },
    { id: 4, label: 'Plan & Billing', key: 'plan' },
    { id: 5, label: 'Review', key: null }
  ];

  dummyOwners = [
    { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'John Doe', email: 'john.doe@example.com' },
    { id: 'bb873c9f-333e-42c2-b942-8395ed548f0e', name: 'Jane Smith', email: 'jane.smith@example.com' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.onboardingForm = this.fb.group({
      gymInfo: this.fb.group({
        name: ['', Validators.required],
        brandName: [''],
        description: [''],
        establishedDate: [''],
        registrationNumber: [''],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        gstNumber: [''],
        websiteUrl: [''],
        logoUrl: [''],
        coverImageUrl: [''],
        address: this.fb.group({
          line1: ['', Validators.required],
          line2: [''],
          city: ['', Validators.required],
          state: ['', Validators.required],
          country: ['', Validators.required],
          postalCode: ['', Validators.required]
        })
      }),
      branches: this.fb.array([]),
      assignedOwnerId: ['', Validators.required],
      plan: this.fb.group({
        subscriptionId: [''],
        billingCycle: ['monthly'],
        isTrial: [true]
      })
    });

    this.addBranch();
  }

  get branches(): FormArray {
    return this.onboardingForm.get('branches') as FormArray;
  }

  addBranch() {
    const branchForm = this.fb.group({
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
    this.branches.push(branchForm);
    this.collapsedBranches.push(false);
  }

  removeBranch(index: number) {
    if (this.branches.length > 1) {
      this.branches.removeAt(index);
      this.collapsedBranches.splice(index, 1);
    }
  }

  toggleBranchCollapse(index: number) {
    this.collapsedBranches[index] = !this.collapsedBranches[index];
  }

  isCurrentStepValid(): boolean {
    if (this.currentStep === 1) {
      return this.onboardingForm.get('gymInfo')?.valid || false;
    }
    if (this.currentStep === 2) {
      return this.branches.length > 0 && this.branches.valid;
    }
    if (this.currentStep === 3) {
      return this.onboardingForm.get('assignedOwnerId')?.valid || false;
    }
    if (this.currentStep === 4) {
      return this.onboardingForm.get('plan')?.valid || false;
    }
    return true;
  }

  nextStep() {
    if (this.isCurrentStepValid() && this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  closeModal() {
    this.close.emit();
  }

  onTopClose() {
    if (this.onboardingForm.dirty) {
      this.isConfirmCancelOpen = true;
    } else {
      this.closeModal();
    }
  }

  submit() {
    if (this.onboardingForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.onboardingForm.value;
      const payload = {
        ...formValue.gymInfo,
        branches: formValue.branches,
        assignedOwnerId: formValue.assignedOwnerId || null,
        planId: formValue.plan.subscriptionId || null,
        isTrial: formValue.plan.isTrial
      };

      console.log('Onboarding Payload:', payload);

      this.gymService.onboardGym(payload).subscribe({
        next: () => {
          this.toastr.success('Gym onboarded successfully!');
          this.isSubmitting = false;
          this.closeModal();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Failed to onboard gym');
          this.isSubmitting = false;
        }
      });
    }
  }

  get f() {
    return this.onboardingForm.value;
  }
}
