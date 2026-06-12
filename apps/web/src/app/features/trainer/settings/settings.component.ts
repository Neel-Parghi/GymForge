import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';

@Component({
  selector: 'app-trainer-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class TrainerSettingsComponent {
  private notification = inject(NotificationService);

  preferences = {
    shiftStartReminder: true,
    clientCheckInNotification: true,
    ptSessionAlerts: true,
    systemSound: false,
    darkMode: true
  };

  saveSettings(): void {
    localStorage.setItem('trainerPreferences', JSON.stringify(this.preferences));
    this.notification.success(CONSTANTS.TRAINER_SETTINGS.SAVE_SUCCESS);
  }
}
