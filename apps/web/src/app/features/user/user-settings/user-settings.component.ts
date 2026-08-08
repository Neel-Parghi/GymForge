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
      pushNotifications: [false],
      workoutReminders: [true]
    });
  }

  ngOnInit() {
    this.loadPreferences();
    this.loadNotificationPreferences();
  }

  loadPreferences() {
    this.userService.getPreferences().subscribe({
      next: (res: any) => {
        if (res) {
          this.fitnessForm.patchValue({
            primaryGoal: res.primaryGoal,
            targetWeight: res.targetWeight,
            targetCalories: res.targetCalories,
            targetProtein: res.targetProtein,
            targetCarbs: res.targetCarbs,
            targetFats: res.targetFats,
            targetTrainingTime: res.targetTrainingTime
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

  loadNotificationPreferences() {
    const saved = localStorage.getItem('gf_notification_preferences');
    if (saved) {
      try {
        this.notificationsForm.patchValue(JSON.parse(saved));
      } catch (e) { }
    }
  }

  saveNotificationPreferences() {
    localStorage.setItem('gf_notification_preferences', JSON.stringify(this.notificationsForm.value));
  }

  saveChanges() {
    if (this.fitnessForm.invalid) {
      this.notificationService.error('Please check the form for errors.');
      return;
    }

    this.isSaving = true;
    this.saveNotificationPreferences();

    this.userService.updatePreferences(this.fitnessForm.value).subscribe({
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
