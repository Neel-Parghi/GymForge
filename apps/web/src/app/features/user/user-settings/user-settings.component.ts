import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
})
export class UserSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  fitnessForm: FormGroup;
  notificationsForm: FormGroup;

  readonly primaryGoalOptions: DropdownOption[] = [
    { label: 'Weight Loss', value: 'Weight Loss', icon: 'fa-solid fa-weight-scale' },
    { label: 'Muscle Gain', value: 'Muscle Gain', icon: 'fa-solid fa-dumbbell' },
    { label: 'Endurance', value: 'Endurance', icon: 'fa-solid fa-person-running' },
    { label: 'Flexibility', value: 'Flexibility', icon: 'fa-solid fa-child-reaching' },
    { label: 'General Fitness', value: 'General Fitness', icon: 'fa-solid fa-heart-pulse' }
  ];

  activeTab: 'fitness' | 'notifications' = 'fitness';

  isLoading = true;
  isSaving = false;

  constructor() {
    this.fitnessForm = this.fb.group({
      primaryGoal: [''],
      targetWeight: [null],
      targetCalories: [null],
      targetProtein: [null],
      targetCarbs: [null],
      targetFats: [null],
      targetTrainingTime: [null]
    });

    this.notificationsForm = this.fb.group({
      emailNotifications: [true],
      workoutReminders: [true]
    });
  }

  ngOnInit() {
    this.loadPreferences();
  }

  loadPreferences() {
    this.userService.getPreferences().subscribe({
      next: (res: any) => {
        const data = res?.data;
        if (data) {
          this.fitnessForm.patchValue({
            primaryGoal: data.primaryGoal,
            targetWeight: data.targetWeight,
            targetCalories: data.targetCalories,
            targetProtein: data.targetProtein,
            targetCarbs: data.targetCarbs,
            targetFats: data.targetFats,
            targetTrainingTime: data.targetTrainingTime
          });
          this.notificationsForm.patchValue({
            emailNotifications: data.emailNotificationsEnabled ?? true,
            workoutReminders: data.workoutRemindersEnabled ?? true
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('Failed to load preferences.');
      }
    });
  }

  saveChanges() {
    if (this.fitnessForm.invalid) {
      this.notificationService.error('Please check the form for errors.');
      return;
    }

    this.isSaving = true;

    const payload = {
      ...this.fitnessForm.value,
      emailNotificationsEnabled: this.notificationsForm.value.emailNotifications,
      workoutRemindersEnabled: this.notificationsForm.value.workoutReminders
    };

    this.userService.updatePreferences(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.notificationService.success('Settings saved successfully!');
      },
      error: () => {
        this.isSaving = false;
        this.notificationService.error('Failed to save settings.');
      }
    });
  }
}
