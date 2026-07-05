import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
})
export class UserSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  fitnessForm: FormGroup;

  activeTab: 'fitness' | 'notifications' = 'fitness';

  notificationPreferences = {
    emailNotifications: true,
    pushNotifications: false,
    workoutReminders: true
  };

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
        this.notificationPreferences = JSON.parse(saved);
      } catch (e) { }
    }
  }

  saveNotificationPreferences() {
    localStorage.setItem('gf_notification_preferences', JSON.stringify(this.notificationPreferences));
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
