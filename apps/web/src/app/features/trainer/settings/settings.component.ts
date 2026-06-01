import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trainer-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class TrainerSettingsComponent {
  preferences = {
    shiftStartReminder: true,
    clientCheckInNotification: true,
    ptSessionAlerts: true,
    systemSound: false,
    darkMode: true
  };

  saveSettings(): void {
    // Mimic save logic with local storage
    localStorage.setItem('trainerPreferences', JSON.stringify(this.preferences));
    alert('Preferences saved successfully!');
  }
}
