import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';
import { GymService } from '../../../../../core/services/gym.service';
import { ApiResponse } from '../../../../../shared/models/api-response.model';
import { GymOwnerResponse, OnboardGymRequest } from '../../../../../shared/models/gym.model';
import { ConfirmationPopupComponent } from "../../../../../shared/components/confirmation-popup-component/confirmation-popup-component";
import { PricingService } from '../../../../../core/services/pricing.service';
import { ValidationMessage } from "../../../../../shared/components/validation-message/validation-message";
import { CONSTANTS } from '../../../../../core/constants/constants';
import { PricingPlan } from '../../../../../shared/models/pricing.model';

@Component({
  selector: 'app-gym-onboarding-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationPopupComponent, ValidationMessage],
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
  private notification = inject(NotificationService);

  steps = [
    { id: 1, label: 'Gym Info', key: 'gymInfo' },
    { id: 2, label: 'Branches', key: 'branches' },
    { id: 3, label: 'Assign Owner', key: 'assignedOwnerId' },
    { id: 4, label: 'Plan & Billing', key: 'plan' },
    { id: 5, label: 'Review', key: null }
  ];

  gymOwners: GymOwnerResponse[] = [];
  pricingService = inject(PricingService);
  plans: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.initForm();
    this.getGymOwners();
    this.loadPlans();
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

  loadPlans() {
    this.pricingService.getAllPlans().subscribe((res: ApiResponse<PricingPlan[]>) => {
      this.plans = res?.Data || [];
    });
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
      const payload: OnboardGymRequest = {
        ...formValue.gymInfo,
        branches: formValue.branches,
        assignedOwnerId: formValue.assignedOwnerId || null,
        planId: formValue.plan.subscriptionId || null,
        isTrial: formValue.plan.isTrial
      };


      this.gymService.onboardGym(payload).subscribe({
        next: () => {
          this.notification.success(CONSTANTS.GYM_ONBOARD_SUCCESS_MESSAGE);
          this.isSubmitting = false;
          this.closeModal();
        },
        error: (error) => {
          this.notification.error(error.error?.message || CONSTANTS.GYM_ONBOARD_ERROR_MESSAGE);
          this.isSubmitting = false;
        }
      });
    }
  }

  get f() {
    return this.onboardingForm.value;
  }

  getSelectedOwnerName(): string {
    const ownerId = this.onboardingForm.get('assignedOwnerId')?.value;
    const owner = this.gymOwners.find(o => o.id === ownerId);
    return owner ? owner.name : 'Not Assigned';
  }

  getSelectedPlanName(): string {
    const planId = this.onboardingForm.get('plan.subscriptionId')?.value;
    const plan = this.plans.find(p => p.id === planId);
    return plan ? (plan.name || plan.Name) : 'No Plan Selected (Trial)';
  }

  getGymOwners() {
    this.gymService.getGymOwnersList().subscribe({
      next: (res: ApiResponse<GymOwnerResponse[]>) => {
        this.gymOwners = res.Data;
      },
      error: (err: any) => {
        this.notification.error(err.error?.message || CONSTANTS.GYM_OWNER_LOAD_ERROR_MESSAGE);
      }
    });
  }
}