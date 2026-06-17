import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.scss',
})
export class UserSettings {
  preferences = {
    emailNotifications: true,
    pushNotifications: false,
    workoutReminders: true,
    marketingEmails: false
  };

  saveChanges() {
    console.log('Saved settings', this.preferences);
  }
}
