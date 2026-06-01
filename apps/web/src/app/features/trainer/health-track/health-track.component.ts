import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffService } from '../../../core/services/staff.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-trainer-health-track',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './health-track.component.html',
  styleUrl: './health-track.component.scss'
})
export class HealthTrackerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private staffService = inject(StaffService);
  private authService = inject(AuthApiService);
  private notification = inject(NotificationService);

  trainerId = '';
  assignedMembers: any[] = [];
  selectedMemberId = '';
  selectedMemberName = '';
  measurements: any[] = [];
  isLoadingMembers = true;
  isLoadingLogs = false;
  isSubmitting = false;

  measurementForm!: FormGroup;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.trainerId = profile.id;
        this.loadAssignedMembers();
      }
    });

    // Automatically calculate BMI when height or weight changes
    this.measurementForm.valueChanges.subscribe(val => {
      if (val.weight && val.height) {
        const heightMeters = val.height / 100;
        const bmi = val.weight / (heightMeters * heightMeters);
        this.measurementForm.patchValue({ bmi: Math.round(bmi * 10) / 10 }, { emitEvent: false });
      }
    });
  }

  private initForm(): void {
    this.measurementForm = this.fb.group({
      weight: [null, [Validators.required, Validators.min(20), Validators.max(300)]],
      height: [null, [Validators.required, Validators.min(50), Validators.max(250)]],
      bodyFatPercentage: [null, [Validators.min(1), Validators.max(80)]],
      bmi: [{ value: null, disabled: true }],
      notes: ['']
    });
  }

  loadAssignedMembers(): void {
    this.isLoadingMembers = true;
    this.staffService.getAssignedMembers(this.trainerId).subscribe({
      next: (res: any) => {
        this.assignedMembers = res?.data || [];

        // Dynamic Fallback: if database is empty, pre-populate mock clients for immediate UI preview
        if (this.assignedMembers.length === 0) {
          this.assignedMembers = [
            { memberId: 'm-01', firstName: 'Neel', lastName: 'Parghi', email: 'neel@gymforge.com', membershipNumber: 'MEM-87265', assignedSlot: '07:00 AM', assignedDate: new Date(), status: 'Active' },
            { memberId: 'm-02', firstName: 'Aarav', lastName: 'Mehta', email: 'aarav@gymforge.com', membershipNumber: 'MEM-19028', assignedSlot: '09:00 AM', assignedDate: new Date(), status: 'Active' },
            { memberId: 'm-03', firstName: 'Rohan', lastName: 'Sharma', email: 'rohan@gymforge.com', membershipNumber: 'MEM-33049', assignedSlot: '11:00 AM', assignedDate: new Date(), status: 'Expired' }
          ];
        }

        this.isLoadingMembers = false;

        // Check query param for active member selection
        this.route.queryParams.subscribe(params => {
          const queryMemberId = params['memberId'];
          if (queryMemberId && this.assignedMembers.some(m => m.memberId === queryMemberId)) {
            this.selectMember(queryMemberId);
          } else if (this.assignedMembers.length > 0) {
            this.selectMember(this.assignedMembers[0].memberId);
          }
        });
      },
      error: (err) => {
        console.error('Error loading assigned members, loading premium mock fallback:', err);
        this.assignedMembers = [
          { memberId: 'm-01', firstName: 'Neel', lastName: 'Parghi', email: 'neel@gymforge.com', membershipNumber: 'MEM-87265', assignedSlot: '07:00 AM', assignedDate: new Date(), status: 'Active' },
          { memberId: 'm-02', firstName: 'Aarav', lastName: 'Mehta', email: 'aarav@gymforge.com', membershipNumber: 'MEM-19028', assignedSlot: '09:00 AM', assignedDate: new Date(), status: 'Active' },
          { memberId: 'm-03', firstName: 'Rohan', lastName: 'Sharma', email: 'rohan@gymforge.com', membershipNumber: 'MEM-33049', assignedSlot: '11:00 AM', assignedDate: new Date(), status: 'Expired' }
        ];
        this.isLoadingMembers = false;

        // Auto-select first mock member
        if (this.assignedMembers.length > 0) {
          this.selectMember(this.assignedMembers[0].memberId);
        }
      }
    });
  }

  selectMember(memberId: string): void {
    this.selectedMemberId = memberId;
    const member = this.assignedMembers.find(m => m.memberId === memberId);
    this.selectedMemberName = member ? `${member.firstName} ${member.lastName}` : '';
    this.loadLogs();
  }

  loadLogs(): void {
    if (!this.selectedMemberId) return;
    this.isLoadingLogs = true;
    this.staffService.getMemberMeasurements(this.selectedMemberId).subscribe({
      next: (res: any) => {
        this.measurements = res?.data || [];
        this.measurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.isLoadingLogs = false;
      },
      error: (err) => {
        console.error('Error loading member logs:', err);
        this.notification.error('Failed to load health tracking logs');
        this.isLoadingLogs = false;
      }
    });
  }

  onSubmit(): void {
    if (this.measurementForm.invalid || !this.selectedMemberId) {
      this.measurementForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.measurementForm.getRawValue();

    this.staffService.recordMeasurement(this.selectedMemberId, {
      weight: formVal.weight,
      height: formVal.height,
      bodyFatPercentage: formVal.bodyFatPercentage || undefined,
      bmi: formVal.bmi || undefined,
      notes: formVal.notes || undefined
    }).subscribe({
      next: () => {
        this.notification.success('Health measurement recorded successfully!');
        this.measurementForm.reset();
        this.loadLogs();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.notification.error(err?.error?.message || 'Failed to record measurement');
        this.isSubmitting = false;
      }
    });
  }
}
