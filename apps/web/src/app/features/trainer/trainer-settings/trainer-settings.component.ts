import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';

@Component({
  selector: 'app-trainer-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trainer-settings.component.html',
  styleUrl: './trainer-settings.component.scss'
})
export class TrainerSettingsComponent implements OnInit {
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  settingsForm: FormGroup = this.fb.group({
    shiftStartReminder: [true],
    clientCheckInNotification: [true],
    ptSessionAlerts: [true],
    systemSound: [false],
    darkMode: [true]
  });

  ngOnInit(): void {
    const cachedPrefs = localStorage.getItem('trainerPreferences');
    if (cachedPrefs) {
      this.settingsForm.patchValue(JSON.parse(cachedPrefs));
    }
  }

  saveSettings(): void {
    localStorage.setItem('trainerPreferences', JSON.stringify(this.settingsForm.value));
    this.notification.success(CONSTANTS.TRAINER_SETTINGS.SAVE_SUCCESS);
  }
}
