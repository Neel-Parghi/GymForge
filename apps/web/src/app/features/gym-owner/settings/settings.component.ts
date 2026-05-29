import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';
import { DateTimePickerComponent } from '../../../shared/components/date-time-picker/date-time-picker.component';
import { GymSettingsService } from '../../../core/services/gym-settings.service';
import { GymService } from '../../../core/services/gym.service';

interface Holiday {
  id: string;
  name: string;
  date: string;
  branchId?: string | null;
  branchName?: string | null;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DropdownComponent, DateTimePickerComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private settingsService = inject(GymSettingsService);
  private gymService = inject(GymService);

  settingsForm!: FormGroup;
  holidayForm!: FormGroup;
  activeTab: 'permissions' | 'notifications' | 'calendar' = 'permissions';
  saving = false;

  // Dropdown Options
  expiryWarningOptions: DropdownOption[] = [
    { label: '3 Days Before', value: 3 },
    { label: '5 Days Before', value: 5 },
    { label: '7 Days Before', value: 7 },
    { label: '10 Days Before', value: 10 },
    { label: '14 Days Before', value: 14 }
  ];

  branchOptions: DropdownOption[] = [];

  // RBAC Config Schema
  roles = [
    { key: 'Staff', label: 'Front Desk Staff' },
    { key: 'Trainer', label: 'Trainer' }
  ];

  modules = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
    { key: 'members', label: 'Members Management', icon: 'fa-solid fa-users' },
    { key: 'attendance', label: 'Attendance Counter', icon: 'fa-solid fa-calendar-check' },
    { key: 'staff', label: 'Staff & Trainers', icon: 'fa-solid fa-user-tie' },
    { key: 'plans', label: 'Gym Plans & Pricing', icon: 'fa-solid fa-receipt' },
    { key: 'inventory', label: 'Inventory Assets', icon: 'fa-solid fa-boxes-stacked' },
    { key: 'billing', label: 'Billing & Invoices', icon: 'fa-solid fa-file-invoice-dollar' }
  ];

  holidays: Holiday[] = [];

  ngOnInit() {
    this.initForm();
    this.loadBackendSettings();
    this.loadBranches();
    this.loadBackendHolidays();
  }

  private initForm(savedRights: any = {}, savedSettings: any = {}) {
    const matrixGroup: any = {};
    this.roles.forEach(role => {
      this.modules.forEach(mod => {
        const key = `${role.key}_${mod.key}`;
        
        // Define fallback defaults if no settings are present
        let defaultValue = true;
        if (role.key === 'Trainer') {
          defaultValue = mod.key === 'dashboard' || mod.key === 'members' || mod.key === 'attendance';
        } else if (role.key === 'Staff') {
          defaultValue = mod.key === 'dashboard' || mod.key === 'members' || mod.key === 'attendance' || mod.key === 'inventory';
        }

        const value = savedRights[key] !== undefined ? savedRights[key] : defaultValue;
        matrixGroup[key] = [value];
      });
    });

    const defaults = {
      expiryWarningDays: 7,
      ...savedSettings
    };

    matrixGroup['expiryWarningDays'] = [defaults.expiryWarningDays, [Validators.required]];

    this.settingsForm = this.fb.group(matrixGroup);

    this.holidayForm = this.fb.group({
      newHolidayName: ['', Validators.required],
      newHolidayDate: ['', Validators.required],
      newHolidayBranch: ['All Locations', Validators.required]
    });
  }

  private loadBackendSettings() {
    // 1. Check if settings are already preloaded in cache
    const cache = this.settingsService.getSettingsSync();
    if (cache) {
      this.initForm(cache.roleRights || {}, cache.operations || {});
      return;
    }

    // 2. Fetch fresh from backend HTTP API
    this.settingsService.loadSettings().subscribe({
      next: () => {
        const data = this.settingsService.getSettingsSync();
        if (data) {
          this.initForm(data.roleRights || {}, data.operations || {});
        }
      },
      error: () => this.notification.error('Failed to load settings from backend.')
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) {
      this.notification.error('Please fix the validation errors before saving.');
      return;
    }

    this.saving = true;

    // Gather Role Rights Matrix
    const rightsMatrix: any = {};
    this.roles.forEach(role => {
      this.modules.forEach(mod => {
        const key = `${role.key}_${mod.key}`;
        rightsMatrix[key] = this.settingsForm.value[key];
      });
    });

    // Gather Automations Settings
    const automationsSettings = {
      expiryWarningDays: this.settingsForm.value.expiryWarningDays
    };

    // Save to PostgreSQL backend DB via HTTP PUT request
    this.settingsService.updateSettings(rightsMatrix, automationsSettings).subscribe({
      next: () => {
        this.saving = false;
        this.notification.success('Operations & Role Rights settings updated successfully!');
        this.settingsForm.markAsPristine();
      },
      error: (err) => {
        this.saving = false;
        this.notification.error('Failed to save settings to the backend.');
        console.error('Error saving settings', err);
      }
    });
  }

  loadBranches() {
    this.gymService.getMyBranches().subscribe({
      next: (res) => {
        const branchesList = res.data || res || [];
        const options: DropdownOption[] = [{ label: 'All Locations', value: 'All Locations' }];
        branchesList.forEach((b: any) => {
          options.push({ label: b.name, value: b.id });
        });
        this.branchOptions = options;
      },
      error: () => {}
    });
  }

  loadBackendHolidays() {
    this.settingsService.getHolidays().subscribe({
      next: (res) => {
        this.holidays = res.data || res || [];
      },
      error: (err) => console.error('Failed to load holidays closures', err)
    });
  }

  addHoliday() {
    if (this.holidayForm.invalid) {
      this.notification.error('Please enter a holiday name and select a date.');
      return;
    }

    const formVal = this.holidayForm.value;
    
    // Resolve branchId (if 'All Locations', it is null)
    const branchId = formVal.newHolidayBranch === 'All Locations' ? null : formVal.newHolidayBranch;

    const payload = {
      name: formVal.newHolidayName,
      date: formVal.newHolidayDate,
      branchId: branchId
    };

    this.settingsService.addHoliday(payload).subscribe({
      next: () => {
        this.notification.success('Holiday closure scheduled successfully!');
        this.holidayForm.reset({
          newHolidayName: '',
          newHolidayDate: '',
          newHolidayBranch: 'All Locations'
        });
        this.loadBackendHolidays(); // reload sorted closures
      },
      error: () => this.notification.error('Failed to add holiday closure.')
    });
  }

  deleteHoliday(id: string) {
    this.settingsService.deleteHoliday(id).subscribe({
      next: () => {
        this.notification.success('Scheduled closure removed.');
        this.loadBackendHolidays();
      },
      error: () => this.notification.error('Failed to remove scheduled closure.')
    });
  }
}
