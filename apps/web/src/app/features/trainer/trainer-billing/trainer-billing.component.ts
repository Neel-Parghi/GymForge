import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BillingService } from '../../../core/services/billing.service';
import { StaffPayoutDto } from '../../../shared/models/member-invoice.model';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { StaffService } from '../../../core/services/staff.service';

@Component({
  selector: 'app-trainer-billing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './trainer-billing.component.html',
  styleUrl: './trainer-billing.component.scss'
})
export class TrainerBillingComponent implements OnInit {
  private billingService = inject(BillingService);
  private authService = inject(AuthApiService);
  private staffService = inject(StaffService);

  userId = '';
  monthControl = new FormControl('');
  monthsList: { key: string; label: string }[] = [];
  dropdownOptions: DropdownOption[] = [];
  payoutDetails: StaffPayoutDto | null = null;
  assignedMembers: any[] = [];
  loading = false;
  loadingMembers = false;

  get monthKey(): string {
    return this.monthControl.value || '';
  }

  ngOnInit(): void {
    this.generateMonthsList();
    const today = new Date();
    this.monthControl.setValue(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);

    this.monthControl.valueChanges.subscribe(() => {
      this.onMonthChange();
    });

    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userId = profile.id;
        this.loadPayrollOverview();
        this.loadAssignedMembers();
      }
    });
  }

  generateMonthsList(): void {
    const list = [];
    const opts = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      list.push({ key, label });
      opts.push({ value: key, label });
    }
    this.monthsList = list;
    this.dropdownOptions = opts;
  }

  loadPayrollOverview(): void {
    this.loading = true;
    this.payoutDetails = null;
    this.billingService.getStaffPayrollOverview(this.monthKey).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.data?.payouts && res.data.payouts.length > 0) {
          this.payoutDetails = res.data.payouts[0];
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading staff payroll details:', err);
      }
    });
  }

  loadAssignedMembers(): void {
    this.loadingMembers = true;
    this.staffService.getAssignedMembers(this.userId).subscribe({
      next: (res: any) => {
        this.loadingMembers = false;
        this.assignedMembers = res?.data || [];
      },
      error: (err) => {
        this.loadingMembers = false;
        console.error('Error loading assigned members:', err);
      }
    });
  }

  getDuration(startDate: string, endDate: string | null): string {
    if (!startDate) return '-';
    if (!endDate) return 'Ongoing';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const months = Math.round(diffDays / 30);
    if (months <= 0) return '1 month';
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }

  onMonthChange(): void {
    this.loadPayrollOverview();
  }
}
