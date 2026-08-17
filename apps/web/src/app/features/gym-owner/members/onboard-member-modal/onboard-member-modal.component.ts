import { Component, EventEmitter, inject, Input, OnChanges, Output, OnInit, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GymPlan } from '../../../../shared/models/gym-plan.model';
import { GymMember, OnboardMemberRequest, RenewSubscriptionRequest } from '../../../../shared/models/member.model';
import { Gender, PaymentStatus } from '../../../../shared/enums/member-enums';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { ConfirmationPopupComponent } from '../../../../shared/components/confirmation-popup/confirmation-popup.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { DateTimePickerComponent } from '../../../../shared/components/date-time-picker/date-time-picker.component';
import { DropdownOption } from '../../../../shared/models/dropdown.model';
import { BranchContextService } from '../../../../core/services/branch-context.service';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-onboard-member-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationPopupComponent, DropdownComponent, DateTimePickerComponent, TruncatePipe],
  templateUrl: './onboard-member-modal.component.html',
  styleUrl: './onboard-member-modal.component.scss'
})
export class OnboardMemberModal implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Input() plans: GymPlan[] = [];
  @Input() branches: any[] = [];
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
  private branchContextService = inject(BranchContextService);

  isGymOwner = false;
  currentStep = 1;
  totalSteps = 4;
  steps = [
    { id: 1, label: 'Personal & Contact' },
    { id: 2, label: 'Medical & Fitness' },
    { id: 3, label: 'Membership Plan' },
    { id: 4, label: 'Review' }
  ];

  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9 ]+$/)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9 ]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
    dateOfBirth: ['', Validators.required],
    gender: ['', Validators.required],
    bloodGroup: [''],
    branchId: [''],
    address: this.fb.group({
      line1: ['', [Validators.maxLength(100)]],
      line2: ['', [Validators.maxLength(100)]],
      city: ['', [Validators.maxLength(20)]],
      state: ['', [Validators.maxLength(20)]],
      country: ['', [Validators.maxLength(20)]],
      postalCode: ['', [Validators.maxLength(10)]]
    }),
    medicalConditions: [''],
    fitnessGoals: [[]],
    emergencyContactName: ['', [Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9 ]*$/)]],
    emergencyContactPhone: ['', [Validators.pattern(/^\+?[0-9]{7,15}$/)]],
    gymPlanId: ['', Validators.required],
    startDate: [''],
    paymentStatus: [PaymentStatus.Paid, Validators.required],
    amountPaid: ['']
  });

  submitting = false;
  apiError = '';
  showArchived = false;

  get filteredPlans(): GymPlan[] {
    const selectedPlanId = this.form.get('gymPlanId')?.value;

    if (this.showArchived) {
      return this.plans.filter(plan => {
        if (!plan.isActive) return true;
        if (selectedPlanId && plan.id?.toString().toLowerCase() === selectedPlanId.toString().toLowerCase()) {
          return true;
        }
        return false;
      });
    } else {
      return this.plans.filter(plan => {
        if (plan.isActive) return true;
        if (selectedPlanId && plan.id?.toString().toLowerCase() === selectedPlanId.toString().toLowerCase()) {
          return true;
        }
        return false;
      });
    }
  }

  toggleShowArchived(): void {
    this.showArchived = !this.showArchived;
  }

  readonly genderOptions: DropdownOption[] = [
    { value: Gender.Male, label: 'Male', icon: 'fa-solid fa-mars' },
    { value: Gender.Female, label: 'Female', icon: 'fa-solid fa-venus' },
    { value: Gender.Other, label: 'Other', icon: 'fa-solid fa-transgender' },
    { value: Gender.PreferNotToSay, label: 'Prefer not to say', icon: 'fa-solid fa-user-slash' },
  ];

  readonly bloodGroupOptions: DropdownOption[] = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
  ];

  readonly paymentStatusOptions: DropdownOption[] = [
    { value: 1, label: 'Pending', icon: 'fa-solid fa-clock' },
    { value: 2, label: 'Paid', icon: 'fa-solid fa-circle-check' },
    { value: 3, label: 'Partial', icon: 'fa-solid fa-circle-half-stroke' }
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

  get maxDobDate(): Date {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 10);
    return d;
  }

  isFitnessGoalsOpen = false;
  isConfirmCancelOpen = false;

  ngOnInit(): void {
    this.isGymOwner = this.authService.getUserRole() === 'GymOwner';

    this.form.get('paymentStatus')?.valueChanges.subscribe(() => this.updateAmountPaidValidators());
    this.form.get('gymPlanId')?.valueChanges.subscribe(() => this.updateAmountPaidValidators());
    this.updateAmountPaidValidators();
  }

  get selectedPlanPrice(): number {
    const planId = this.form.get('gymPlanId')?.value;
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return 0;
    return plan.isOffer && plan.discountedPrice ? plan.discountedPrice : plan.price;
  }

  get isPartialPayment(): boolean {
    return Number(this.form.get('paymentStatus')?.value) === PaymentStatus.Partial;
  }

  private updateAmountPaidValidators(): void {
    const amountPaidControl = this.form.get('amountPaid');
    if (!amountPaidControl) return;

    if (this.isPartialPayment) {
      const planPrice = this.selectedPlanPrice;
      const maxAmount = planPrice > 0.01 ? planPrice - 0.01 : 0.01;
      amountPaidControl.setValidators([Validators.required, Validators.min(0.01), Validators.max(maxAmount)]);
    } else {
      amountPaidControl.clearValidators();
    }
    amountPaidControl.updateValueAndValidity({ emitEvent: false });
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
      this.showArchived = false;

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
            branchId: this.member!.branchId || '',
            address: this.member!.address || {
              line1: '', line2: '', city: '', state: '', country: '', postalCode: ''
            },
            medicalConditions: this.member!.medicalConditions || '',
            fitnessGoals: this.member!.fitnessGoals || [],
            emergencyContactName: this.member!.emergencyContactName || '',
            emergencyContactPhone: this.member!.emergencyContactPhone || '',
            gymPlanId: planId,
            startDate: this.member!.currentSubscription?.startDate?.split('T')?.[0] || '',
            paymentStatus: this.member!.currentSubscription?.paymentStatus ?? PaymentStatus.Paid,
            amountPaid: this.member!.currentSubscription?.amountPaid || ''
          });

          this.form.get('gymPlanId')?.updateValueAndValidity();
          this.updateAmountPaidValidators();
          this.cdr.detectChanges();
        }, 100);
      } else if (!this.isEdit) {
        const defaultBranchId = this.getDefaultBranchId() || this.branchContextService.getActiveBranchId() || '';
        this.form.reset({
          gender: '',
          bloodGroup: '',
          gymPlanId: '',
          paymentStatus: PaymentStatus.Paid,
          amountPaid: '',
          fitnessGoals: [],
          branchId: defaultBranchId,
          address: {
            line1: '', line2: '', city: '', state: '', country: '', postalCode: ''
          }
        });
        this.updateAmountPaidValidators();
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
        this.form.get('emergencyContactName')?.valid &&
        this.form.get('emergencyContactPhone')?.valid &&
        this.form.get('gender')?.valid);
    }
    if (this.currentStep === 2) {
      // Step 2 is all optional right now
      return true;
    }
    if (this.currentStep === 3) {
      return !!(this.form.get('gymPlanId')?.valid &&
        (!this.isPartialPayment || this.form.get('amountPaid')?.valid));
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
      this.form.get('emergencyContactName')?.markAsTouched();
      this.form.get('emergencyContactPhone')?.markAsTouched();
    } else if (this.currentStep === 3) {
      this.form.get('gymPlanId')?.markAsTouched();
      this.form.get('amountPaid')?.markAsTouched();
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

  jumpToStep(stepId: number): void {
    if (this.isEdit) {
      this.currentStep = stepId;
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.isCurrentStepValid()) {
      console.warn('Form validation failed. Details:');
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.warn(`Invalid field: ${key}`, control.errors);
        }
      });
      const addressControl = this.form.get('address') as FormGroup;
      if (addressControl?.invalid) {
        Object.keys(addressControl.controls).forEach(key => {
          const ac = addressControl.get(key);
          if (ac?.invalid) {
            console.warn(`Invalid field: address.${key}`, ac.errors);
          }
        });
      }

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
      paymentStatus: Number(v.paymentStatus),
      branchId: v.branchId || undefined,
      amountPaid: this.isPartialPayment ? Number(v.amountPaid) : undefined
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

  getDefaultBranchId(): string {
    if (this.branches && this.branches.length > 0) {
      return this.branches[0].id;
    }
    return '';
  }

  get branchOptions(): DropdownOption[] {
    const options: DropdownOption[] = [{ label: 'No Branch (General)', value: '' }];
    this.branches.forEach(b => options.push({ label: b.name, value: b.id }));
    return options;
  }

  getSelectedBranchName(): string {
    const branchId = this.form.get('branchId')?.value;
    if (!branchId) return 'No Branch (General)';
    const branch = this.branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Unknown Branch';
  }

  getFullAddress(): string {
    const addr = this.form.get('address')?.value;
    if (!addr || !addr.line1) return '';
    return [
      addr.line1,
      addr.line2,
      addr.city,
      `${addr.state || ''} ${addr.postalCode || ''}`.trim(),
      addr.country
    ].filter(Boolean).join(', ');
  }
}
