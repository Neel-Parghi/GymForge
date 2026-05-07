import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfigurationService } from '../../../core/services/configuration.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';

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

  settingsForm: FormGroup;
  activeTab: 'general' | 'strategy' | 'financial' | 'legal' = 'general';
  loading = true;
  saving = false;

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
      billingAddress: ['']
    });
  }

  ngOnInit() {
    this.checkQueryParams();
    this.loadSettings();
  }

  private checkQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const tab = params['tab'];
        if (tab === 'strategy' || tab === 'legal' || tab === 'general') {
          this.activeTab = tab as any;
        }
      }
    });
  }

  loadSettings() {
    this.configService.getConfig().subscribe({
      next: (res) => {
        if (res.data) {
          this.settingsForm.patchValue(res.data);
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
