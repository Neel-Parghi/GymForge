import { Component, EventEmitter, inject, Input, OnChanges, Output, OnInit, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GymPlan } from '../../../../shared/models/gym-plan.model';
import { GymMember, OnboardMemberRequest, RenewSubscriptionRequest } from '../../../../shared/models/member.model';
import { Gender } from '../../../../shared/enums/member-enums';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { ConfirmationPopupComponent } from '../../../../shared/components/confirmation-popup-component/confirmation-popup-component';

@Component({
  selector: 'app-onboard-member-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationPopupComponent],
  templateUrl: './onboard-member-modal.html',
  styleUrl: './onboard-member-modal.scss'
})
export class OnboardMemberModal implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Input() plans: GymPlan[] = [];
  @Input() isEdit = false;
  @Input() member: GymMember | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<OnboardMemberRequest>();
  @Output() freeze = new EventEmitter<string>();
  @Output() unfreeze = new EventEmitter<string>();
  @Output() toggle = new EventEmitter<string>();
  @Output() renew = new EventEmitter<{ memberId: string; request: RenewSubscriptionRequest }>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthApiService);
  private cdr = inject(ChangeDetectorRef);

  currentStep = 1;
  totalSteps = 4;
  steps = [
    { id: 1, label: 'Personal & Contact' },
    { id: 2, label: 'Medical & Fitness' },
    { id: 3, label: 'Membership Plan' },
    { id: 4, label: 'Review' }
  ];

  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
    dateOfBirth: ['', Validators.required],
    gender: ['', Validators.required],
    bloodGroup: [''],
    address: this.fb.group({
      line1: [''],
      line2: [''],
      city: [''],
      state: [''],
      country: [''],
      postalCode: ['']
    }),
    medicalConditions: [''],
    fitnessGoals: [[]],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
    gymPlanId: ['', Validators.required],
    startDate: [''],
  });

  submitting = false;
  apiError = '';

  readonly genderOptions = [
    { value: Gender.Male, label: 'Male' },
    { value: Gender.Female, label: 'Female' },
    { value: Gender.Other, label: 'Other' },
    { value: Gender.PreferNotToSay, label: 'Prefer not to say' },
  ];

  readonly fitnessGoalOptions = [
    'Weight Loss',
    'Muscle Gain',
    'Strength & Conditioning',
    'General Fitness',
    'Flexibility & Mobility',
    'Sports Training',
    'Rehabilitation'
  ];

  readonly today = new Date().toISOString().split('T')[0];

  isFitnessGoalsOpen = false;
  isConfirmCancelOpen = false;

  ngOnInit(): void {
  }

  toggleFitnessGoals(): void {
    this.isFitnessGoalsOpen = !this.isFitnessGoalsOpen;
  }

  isGoalSelected(goal: string): boolean {
    const goals = this.form.get('fitnessGoals')?.value || [];
    return goals.includes(goal);
  }

  toggleGoal(goal: string, event: Event): void {
    event.stopPropagation();
    let goals = [...(this.form.get('fitnessGoals')?.value || [])];
    if (goals.includes(goal)) {
      goals = goals.filter(g => g !== goal);
    } else {
      goals.push(goal);
    }
    this.form.get('fitnessGoals')?.setValue(goals);
  }

  getSelectedGoalsText(): string {
    const goals = this.form.get('fitnessGoals')?.value || [];
    if (goals.length === 0) return 'Select...';
    if (goals.length === 1) return goals[0];
    return `${goals.length} selected`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const shouldPatch = (changes['isOpen'] && this.isOpen) || (changes['member'] && this.isOpen && this.isEdit);

    if (shouldPatch) {
      this.apiError = '';
      this.submitting = false;
      this.currentStep = 1;
      this.isFitnessGoalsOpen = false;

      if (this.isEdit && this.member) {
        const planId = this.member.currentSubscription?.gymPlanId || '';

        setTimeout(() => {
          this.form.patchValue({
            firstName: this.member!.firstName,
            lastName: this.member!.lastName,
            email: this.member!.email,
            phoneNumber: this.member!.phoneNumber,
            dateOfBirth: this.member!.dateOfBirth?.split('T')?.[0],
            gender: this.member!.gender,
            bloodGroup: this.member!.bloodGroup || '',
            address: this.member!.address || {
              line1: '', line2: '', city: '', state: '', country: '', postalCode: ''
            },
            medicalConditions: this.member!.medicalConditions || '',
            fitnessGoals: this.member!.fitnessGoals || [],
            emergencyContactName: this.member!.emergencyContactName || '',
            emergencyContactPhone: this.member!.emergencyContactPhone || '',
            gymPlanId: planId,
            startDate: this.member!.currentSubscription?.startDate?.split('T')?.[0] || ''
          });

          this.form.get('gymPlanId')?.updateValueAndValidity();
          this.cdr.detectChanges();
        }, 100);
      } else if (!this.isEdit) {
        this.form.reset({
          gender: '',
          bloodGroup: '',
          gymPlanId: '',
          fitnessGoals: [],
          address: {
            line1: '', line2: '', city: '', state: '', country: '', postalCode: ''
          }
        });
        this.cdr.detectChanges();
      }
    }
  }

  isCurrentStepValid(): boolean {
    if (this.currentStep === 1) {
      return !!(this.form.get('firstName')?.valid &&
        this.form.get('lastName')?.valid &&
        this.form.get('dateOfBirth')?.valid &&
        this.form.get('email')?.valid &&
        this.form.get('phoneNumber')?.valid &&
        this.form.get('gender')?.valid);
    }
    if (this.currentStep === 2) {
      // Step 2 is all optional right now
      return true;
    }
    if (this.currentStep === 3) {
      return !!this.form.get('gymPlanId')?.valid;
    }
    return true;
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      this.form.get('firstName')?.markAsTouched();
      this.form.get('lastName')?.markAsTouched();
      this.form.get('dateOfBirth')?.markAsTouched();
      this.form.get('gender')?.markAsTouched();
      this.form.get('email')?.markAsTouched();
      this.form.get('phoneNumber')?.markAsTouched();
    } else if (this.currentStep === 3) {
      this.form.get('gymPlanId')?.markAsTouched();
    }

    if (this.currentStep < this.totalSteps && this.isCurrentStepValid()) {
      this.currentStep++;
      this.cdr.detectChanges();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.isCurrentStepValid()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const payload: OnboardMemberRequest = {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phoneNumber: v.phoneNumber,
      dateOfBirth: v.dateOfBirth,
      gender: Number(v.gender),
      bloodGroup: v.bloodGroup || undefined,
      address: v.address?.line1 ? {
        line1: v.address.line1,
        line2: v.address.line2 || undefined,
        city: v.address.city,
        state: v.address.state,
        country: v.address.country,
        postalCode: v.address.postalCode
      } : undefined,
      medicalConditions: v.medicalConditions || undefined,
      fitnessGoals: v.fitnessGoals?.length ? v.fitnessGoals : undefined,
      emergencyContactName: v.emergencyContactName || undefined,
      emergencyContactPhone: v.emergencyContactPhone || undefined,
      gymPlanId: v.gymPlanId,
      startDate: v.startDate || undefined,
    };
    this.submitting = true;
    this.submitted.emit(payload);
  }

  setError(msg: string): void {
    this.apiError = msg;
    this.submitting = false;
  }

  stopSubmitting(): void {
    this.submitting = false;
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  closeModal(): void {
    this.isConfirmCancelOpen = false;
    this.close.emit();
  }

  onTopClose(): void {
    if (this.form.dirty) {
      this.isConfirmCancelOpen = true;
    } else {
      this.closeModal();
    }
  }

  onOverlayClick(): void {
    // Disabled overlay click close to prevent accidental data loss
  }

  selectPlan(planId: string): void {
    this.form.get('gymPlanId')?.setValue(planId);
  }

  isPlanSelected(planId: string): boolean {
    const selectedId = this.form.get('gymPlanId')?.value;
    if (!selectedId || !planId) return false;

    const isMatch = selectedId.toString().toLowerCase() === planId.toString().toLowerCase();

    return isMatch;
  }

  getSelectedPlanName(): string {
    const planId = this.form.get('gymPlanId')?.value;
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return 'Not Selected';
    return `${plan.name} — ₹${plan.isOffer && plan.discountedPrice ? plan.discountedPrice : plan.price} / ${plan.durationMonths} mo`;
  }
}
