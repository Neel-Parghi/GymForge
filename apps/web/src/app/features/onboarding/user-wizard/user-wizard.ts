import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { UserService } from '../../../core/services/user.service';
import { ProfileService } from '../../../core/services/profile.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DateTimePickerComponent } from '../../../shared/components/date-time-picker/date-time-picker.component';

@Component({
  selector: 'app-user-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownComponent, DateTimePickerComponent],
  templateUrl: './user-wizard.html',
  styleUrls: ['./user-wizard.scss']
})
export class UserWizardComponent implements OnInit {
  currentStep = 1;
  isSubmitting = false;

  metricsForm: FormGroup;
  calculatedAge: number | null = null;
  calculatedBmi: number | null = null;
  bmiStatus: 'under' | 'normal' | 'over' | null = null;
  maxDobDate: Date;

  goals = [
    { id: 'weight_loss', label: 'Weight Loss', icon: 'fi-rr-fire', desc: 'Burn fat and get leaner', image: '/images/goals/weight_loss.png' },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: 'fi-rr-gym', desc: 'Build size and strength', image: '/images/goals/muscle_gain.png' },
    { id: 'endurance', label: 'Endurance', icon: 'fi-rr-running', desc: 'Improve cardiovascular health', image: '/images/goals/endurance.png' },
    { id: 'flexibility', label: 'Flexibility', icon: 'fi-rr-person-praying', desc: 'Enhance mobility and recovery', image: '/images/goals/flexibility.png' },
    { id: 'general_fitness', label: 'General Fitness', icon: 'fi-rr-heart-pulse', desc: 'Stay active and healthy', image: '/images/goals/general_fitness.png' }
  ];

  genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ];

  selectedGoal: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthApiService,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService,
    private profileService: ProfileService
  ) {
    const today = new Date();
    this.maxDobDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());

    this.metricsForm = this.fb.group({
      height: ['', [Validators.required, Validators.min(50), Validators.max(300)]],
      weight: ['', [Validators.required, Validators.min(20), Validators.max(500)]],
      targetWeight: ['', [Validators.min(20), Validators.max(500)]],
      dob: ['', [Validators.required]],
      gender: ['', Validators.required]
    });
  }

  allowNumbersOnly(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  clampValue(controlName: string, max: number) {
    const control = this.metricsForm.get(controlName);
    if (control && control.value !== null && control.value !== '') {
      if (Number(control.value) > max) {
        control.setValue(max);
      }
    }
  }

  ngOnInit(): void {
    this.loadDraft();
    const user = this.authService.getUserProfile();
    
    if (user && user.currentOnboardingStep) {
      const draft = localStorage.getItem('gymForge_userWizardDraft');
      if (!draft && user.currentOnboardingStep > 1) {
        this.currentStep = user.currentOnboardingStep;
      }
    }

    this.metricsForm.valueChanges.subscribe((value) => {
      this.calculateAge(value.dob);
      this.calculateBmi(value.height, value.weight);
      this.saveDraft();
    });
  }

  calculateAge(dob: string) {
    if (!dob) {
      this.calculatedAge = null;
      return;
    }
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.calculatedAge = age;
  }

  calculateBmi(heightCm: number, weightKg: number) {
    if (heightCm > 0 && weightKg > 0) {
      const heightM = heightCm / 100;
      this.calculatedBmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
      
      if (this.calculatedBmi < 18.5) {
        this.bmiStatus = 'under';
      } else if (this.calculatedBmi >= 25) {
        this.bmiStatus = 'over';
      } else {
        this.bmiStatus = 'normal';
      }
    } else {
      this.calculatedBmi = null;
      this.bmiStatus = null;
    }
  }

  saveDraft() {
    const draft = {
      currentStep: this.currentStep,
      selectedGoal: this.selectedGoal,
      metricsForm: this.metricsForm.value
    };
    localStorage.setItem('gymForge_userWizardDraft', JSON.stringify(draft));
  }

  loadDraft() {
    const draftStr = localStorage.getItem('gymForge_userWizardDraft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.currentStep) this.currentStep = draft.currentStep;
        if (draft.selectedGoal) this.selectedGoal = draft.selectedGoal;
        if (draft.metricsForm) {
          this.metricsForm.patchValue(draft.metricsForm, { emitEvent: false });
        }
      } catch (e) {
        console.error('Failed to parse wizard draft', e);
      }
    }
  }

  selectGoal(goalId: string) {
    this.selectedGoal = goalId;
    this.saveDraft();
  }

  nextStep() {
    if (this.currentStep === 1) {
      this.currentStep = 2;
      this.saveStep(2);
      this.saveDraft();
    } else if (this.currentStep === 2) {
      if (!this.selectedGoal) {
        this.toastr.warning('Please select a primary goal.');
        return;
      }
      this.currentStep = 3;
      this.saveStep(3);
      this.saveDraft();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.saveDraft();
    }
  }

  logout() {
    localStorage.removeItem('gymForge_userWizardDraft');
    this.authService.logout();
  }

  saveStep(step: number) {
    this.userService.saveOnboardingStep(step).subscribe();
  }

  submitMetrics() {
    if (this.metricsForm.invalid || !this.selectedGoal) {
      this.metricsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = {
      primaryGoal: this.selectedGoal,
      ...this.metricsForm.value
    };

    this.userService.completeOnboarding(payload).subscribe({
      next: () => {
        localStorage.removeItem('gymForge_userWizardDraft');
        this.toastr.success('Your profile is set up!');
        this.authService.refreshToken().subscribe(() => {
          this.profileService.getProfile(true).subscribe();
        });
      },
      error: () => {
        this.toastr.error('Failed to save metrics');
        this.isSubmitting = false;
      }
    });
  }
}
