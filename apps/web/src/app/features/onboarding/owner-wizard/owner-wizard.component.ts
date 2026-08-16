import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PricingService } from '../../../core/services/pricing.service';
import { PricingPlan } from '../../../shared/models/pricing.model';
import { ToastrService } from 'ngx-toastr';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { UserService } from '../../../core/services/user.service';
import { GymService } from '../../../core/services/gym.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ValidationMessage } from "../../../shared/components/validation-message/validation-message.component";
import { DateTimePickerComponent } from '../../../shared/components/date-time-picker/date-time-picker.component';
import { TimePickerComponent } from '../../../shared/components/time-picker/time-picker.component';
import { CONSTANTS } from '../../../core/constants/constants';

declare var Razorpay: any;

@Component({
  selector: 'app-owner-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ValidationMessage, DateTimePickerComponent, TimePickerComponent],
  templateUrl: './owner-wizard.component.html',
  styleUrls: ['./owner-wizard.component.scss']
})
export class OwnerWizardComponent implements OnInit {
  currentStep = 1;
  totalSteps = 6;
  collapsedBranches: boolean[] = [];

  showRazorpayModal = false;

  plans: PricingPlan[] = [];
  isLoadingPlans = false;
  selectedPlanId: string | null = null;
  isProcessingPayment = false;
  isSubmitting = false;

  gymForm!: FormGroup;

  private fb = inject(FormBuilder);
  private pricingService = inject(PricingService);
  private authService = inject(AuthApiService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private userService = inject(UserService);
  private gymService = inject(GymService);
  private profileService = inject(ProfileService);
  private ngZone = inject(NgZone);

  ngOnInit(): void {
    this.initForm();
    this.loadDraft();
    const user = this.authService.getUserProfile();

    if (user && user.currentOnboardingStep) {
      const draft = localStorage.getItem('gymForge_ownerWizardDraft');
      if (draft || user.currentOnboardingStep === 1) {
        this.currentStep = user.currentOnboardingStep;
      } else {
        this.currentStep = 1;
      }
    }

    if (this.currentStep >= 4) {
      this.loadPlans();
    }

    this.gymForm.valueChanges.subscribe(() => this.saveDraft());
  }

  saveDraft() {
    localStorage.setItem('gymForge_ownerWizardDraft', JSON.stringify({
      form: this.gymForm.value,
      selectedPlanId: this.selectedPlanId
    }));
  }

  loadDraft() {
    const draftStr = localStorage.getItem('gymForge_ownerWizardDraft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.form) {
          if (draft.form.gymInfo) {
            this.gymForm.get('gymInfo')?.patchValue(draft.form.gymInfo);
          }
          if (draft.form.branches && draft.form.branches.length > 0) {
            this.branches.clear();
            this.collapsedBranches = [];
            draft.form.branches.forEach((branch: any) => {
              const branchForm = this.fb.group({
                name: [branch.name || '', Validators.required],
                address: this.fb.group({
                  line1: [branch.address?.line1 || '', [Validators.required, Validators.maxLength(100)]],
                  line2: [branch.address?.line2 || '', Validators.maxLength(100)],
                  city: [branch.address?.city || '', [Validators.required, Validators.maxLength(20)]],
                  state: [branch.address?.state || '', [Validators.required, Validators.maxLength(20)]],
                  country: [branch.address?.country || '', [Validators.required, Validators.maxLength(20)]],
                  postalCode: [branch.address?.postalCode || '', [Validators.required, Validators.maxLength(10)]]
                }),
                contactNumber: [branch.contactNumber || '', [Validators.required, Validators.pattern(/^(?:\D*\d){10,}\D*$/)]],
                openTime: [branch.openTime || '06:00'],
                closeTime: [branch.closeTime || '22:00']
              });
              this.branches.push(branchForm);
              this.collapsedBranches.push(true);
            });
          }
        }
        if (draft.selectedPlanId) {
          this.selectedPlanId = draft.selectedPlanId;
        }
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    }
  }

  private initForm() {
    this.gymForm = this.fb.group({
      gymInfo: this.fb.group({
        name: ['', Validators.required],
        brandName: [''],
        description: [''],
        establishedDate: [''],
        registrationNumber: ['', Validators.maxLength(30)],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^(?:\D*\d){10,}\D*$/)]],
        gstNumber: ['', Validators.maxLength(30)],
        websiteUrl: [''],
        logoUrl: [''],
        coverImageUrl: [''],
        address: this.fb.group({
          line1: ['', [Validators.required, Validators.maxLength(100)]],
          line2: ['', Validators.maxLength(100)],
          city: ['', [Validators.required, Validators.maxLength(20)]],
          state: ['', [Validators.required, Validators.maxLength(20)]],
          country: ['', [Validators.required, Validators.maxLength(20)]],
          postalCode: ['', [Validators.required, Validators.maxLength(10)]]
        })
      }),
      branches: this.fb.array([])
    });

    this.addBranch();
  }

  get branches(): FormArray {
    return this.gymForm.get('branches') as FormArray;
  }

  addBranch() {
    const branchForm = this.fb.group({
      name: ['', Validators.required],
      address: this.fb.group({
        line1: ['', [Validators.required, Validators.maxLength(100)]],
        line2: ['', Validators.maxLength(100)],
        city: ['', [Validators.required, Validators.maxLength(20)]],
        state: ['', [Validators.required, Validators.maxLength(20)]],
        country: ['', [Validators.required, Validators.maxLength(20)]],
        postalCode: ['', [Validators.required, Validators.maxLength(10)]]
      }),
      contactNumber: ['', [Validators.required, Validators.pattern(/^(?:\D*\d){10,}\D*$/)]],
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

  copyGymAddressToBranch(event: any, index: number): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      const gymAddress = this.gymForm.get('gymInfo.address')?.value;
      const gymPhone = this.gymForm.get('gymInfo.phone')?.value;
      if (gymAddress) {
        this.branches.at(index).get('address')?.patchValue({
          line1: gymAddress.line1,
          line2: gymAddress.line2,
          city: gymAddress.city,
          state: gymAddress.state,
          country: gymAddress.country,
          postalCode: gymAddress.postalCode
        });
      }
      if (gymPhone) {
        this.branches.at(index).get('contactNumber')?.setValue(gymPhone);
      }
    } else {
      this.branches.at(index).get('address')?.patchValue({
        line1: '',
        line2: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      });
      this.branches.at(index).get('contactNumber')?.setValue('');
    }
  }

  loadPlans() {
    this.isLoadingPlans = true;
    this.pricingService.getAllPlans().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.plans = res.data.filter(p => p.isActive);
        }
        this.isLoadingPlans = false;
      },
      error: () => {
        this.toastr.error('Failed to load pricing plans');
        this.isLoadingPlans = false;
      }
    });
  }

  selectPlan(id: string) {
    this.selectedPlanId = id;
    this.saveDraft();
  }

  isCurrentStepValid(): boolean {
    if (this.currentStep === 1) {
      return true;
    }
    if (this.currentStep === 2) {
      return this.gymForm.get('gymInfo')?.valid || false;
    }
    if (this.currentStep === 3) {
      return this.branches.length > 0 && this.branches.valid;
    }
    if (this.currentStep === 4) {
      return !!this.selectedPlanId;
    }
    return true;
  }

  nextStep() {
    if (!this.isCurrentStepValid()) {
      if (this.currentStep === 4 && !this.selectedPlanId) {
        this.toastr.warning('Please select a subscription plan to continue.');
      } else {
        this.gymForm.markAllAsTouched();
      }
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      if (this.currentStep === 4) {
        this.loadPlans();
      }
      this.saveStep(this.currentStep);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.saveDraft();
    }
  }

  logout() {
    localStorage.removeItem('gymForge_ownerWizardDraft');
    this.authService.logout();
  }

  saveStep(step: number) {
    this.userService.saveOnboardingStep(step).subscribe();
  }

  getSelectedPlanName(): string {
    return this.plans.find(p => p.id === this.selectedPlanId)?.name || 'Unknown Plan';
  }

  getSelectedPlanPrice(): number {
    return this.plans.find(p => p.id === this.selectedPlanId)?.price || 0;
  }

  processPayment() {
    this.isProcessingPayment = true;

    const options = {
      key: CONSTANTS.PAYMENT.RAZORPAY.KEY_ID,
      amount: this.getSelectedPlanPrice() * 100, // Amount in paise
      currency: CONSTANTS.PAYMENT.RAZORPAY.CURRENCY,
      name: CONSTANTS.PAYMENT.RAZORPAY.COMPANY_NAME,
      description: `Subscription for ${this.getSelectedPlanName()}`,
      handler: (response: any) => {
        this.ngZone.run(() => {
          this.toastr.success('Payment completed successfully!');
          this.submitGymSetup(response.razorpay_payment_id);
        });
      },
      prefill: {
        name: this.gymForm.get('gymInfo.name')?.value || 'Gym Owner',
        email: this.gymForm.get('gymInfo.email')?.value || 'owner@example.com',
        contact: this.gymForm.get('gymInfo.phone')?.value || ''
      },
      theme: { color: CONSTANTS.PAYMENT.RAZORPAY.THEME_COLOR },
      modal: {
        ondismiss: () => {
          this.ngZone.run(() => {
            this.isProcessingPayment = false;
          });
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  submitGymSetup(transactionId: string | null = null) {
    this.isSubmitting = true;

    const ownerId = this.authService.getUserId() || this.authService.getUserProfile()?.id;
    if (!ownerId) {
      this.toastr.error('User profile not found. Please log in again.');
      this.isSubmitting = false;
      return;
    }

    const formValue = this.gymForm.value;
    const payload = {
      ...formValue.gymInfo,
      branches: formValue.branches,
      assignedOwnerId: ownerId,
      planId: this.selectedPlanId,
      isTrial: false,
      transactionId: transactionId
    };

    this.gymService.onboardGym(payload).subscribe({
      next: () => {
        localStorage.removeItem('gymForge_ownerWizardDraft');
        this.toastr.success('Welcome to GymForge!');
        this.authService.refreshToken().subscribe(() => {
          this.profileService.getProfile(true).subscribe(() => {
            this.router.navigate(['/gym-owner/dashboard']);
          });
        });
      },
      error: () => {
        this.toastr.error('Failed to complete setup');
        this.isSubmitting = false;
      }
    });
  }
}
