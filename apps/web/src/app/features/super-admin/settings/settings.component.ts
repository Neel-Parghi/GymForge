import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfigurationService } from '../../../core/services/configuration.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';
import { AuthApiService } from '../../../core/services/auth-api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configService = inject(ConfigurationService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthApiService);

  settingsForm: FormGroup;
  activeTab: 'general' | 'strategy' | 'financial' | 'legal' | 'status' = 'general';
  loading = true;
  saving = false;
  isAdmin = false;

  constructor() {
    this.settingsForm = this.fb.group({
      platformName: ['', Validators.required],
      billingEmail: ['', [Validators.required, Validators.email]],
      taxPercentage: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
      gracePeriodDays: [7, [Validators.required, Validators.min(0)]],
      yearlyRevenueTarget: [0, [Validators.required, Validators.min(0)]],
      subscriptionTarget: [0, [Validators.required, Validators.min(0)]],
      uptimeThreshold: [99.9, [Validators.required, Validators.min(0), Validators.max(100)]],
      currency: [CONSTANTS.DASHBOARD.CURRENCY],
      supportPhone: [''],
      supportEmail: ['', [Validators.email]],
      isMaintenanceMode: [false],
      maintenanceStartTime: [null],
      maintenanceEndTime: [null],
      termsUrl: [''],
      privacyUrl: [''],
      billingAddress: [''],
      gstNo: ['']
    });
  }

  ngOnInit() {
    this.isAdmin = this.authService.getUserRole() === 'SuperAdmin';
    this.checkQueryParams();
    this.loadSettings();
    if (!this.isAdmin) {
      this.settingsForm.disable();
    }
  }

  private checkQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const tab = params['tab'];
        if (tab === 'strategy' || tab === 'legal' || tab === 'general' || tab === 'financial' || tab === 'status') {
          this.activeTab = tab as any;
        }
      }
    });
  }

  formatDateForInput(dateString: any): string | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  loadSettings() {
    this.configService.getConfig().subscribe({
      next: (res) => {
        if (res.data) {
          const config = { ...res.data };
          if (config.maintenanceStartTime) {
            config.maintenanceStartTime = this.formatDateForInput(config.maintenanceStartTime);
          }
          if (config.maintenanceEndTime) {
            config.maintenanceEndTime = this.formatDateForInput(config.maintenanceEndTime);
          }
          this.settingsForm.patchValue(config);
        }
        this.loading = false;
      }
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) return;

    this.saving = true;
    this.configService.updateConfig(this.settingsForm.value).subscribe({
      next: () => {
        this.notification.success(CONSTANTS.SETTINGS.UPDATE_SUCCESS);
        this.saving = false;
      },
      error: () => {
        this.notification.error(CONSTANTS.SETTINGS.UPDATE_ERROR);
        this.saving = false;
      }
    });
  }
}
