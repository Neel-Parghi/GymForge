import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HealthTrackerHistoryComponent } from './components/health-tracker-history/health-tracker-history.component';
import { HealthTrackerFormComponent } from './components/health-tracker-form/health-tracker-form.component';
import { HealthTrackerReportComponent } from './components/health-tracker-report/health-tracker-report.component';

@Component({
  selector: 'app-member-detail-health-tracker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HealthTrackerHistoryComponent,
    HealthTrackerFormComponent,
    HealthTrackerReportComponent
  ],
  templateUrl: './member-detail-health-tracker.html',
  styleUrl: './member-detail-health-tracker.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PTMemberDetailHealthTrackerComponent implements OnInit, OnChanges, OnDestroy {
  private fb = inject(FormBuilder);

  @Input() measurements: any[] = [];
  @Input() isLoadingLogs = false;
  @Input() isSubmittingProgress = false;

  @Output() recordMeasurement = new EventEmitter<any>();

  measurementForm!: FormGroup;
  activeTrackerMode: 'basic' | 'advanced' = 'basic';
  expandedLogs: { [key: string]: boolean } = {};
  showForm = false;
  selectedLog: any = null;
  showDrawer = false;

  ngOnInit(): void {
    this.initProgressForm();

    // Auto-calculate BMI
    this.measurementForm.valueChanges.subscribe(val => {
      if (val.weight && val.height) {
        const heightMeters = val.height / 100;
        const bmi = val.weight / (heightMeters * heightMeters);
        this.measurementForm.patchValue({ bmi: Math.round(bmi * 10) / 10 }, { emitEvent: false });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['measurements'] && !changes['measurements'].firstChange) {
      this.measurementForm.reset();
      this.activeTrackerMode = 'basic';
      this.expandedLogs = {};
      this.showForm = false;
      this.closeDetailsDrawer();
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
  }

  previousLog: any = null;

  openDetailsDrawer(log: any): void {
    this.selectedLog = log;
    const idx = this.measurements.findIndex(m => m.id === log.id);
    this.previousLog = idx !== -1 && idx + 1 < this.measurements.length ? this.measurements[idx + 1] : null;
    this.showDrawer = true;
    document.body.classList.add('modal-open');
  }

  closeDetailsDrawer(): void {
    this.showDrawer = false;
    this.selectedLog = null;
    this.previousLog = null;
    document.body.classList.remove('modal-open');
  }

  getDelta(current: number | undefined | null, previous: number | undefined | null): { value: string, class: string, icon: string } | null {
    if (current === undefined || current === null || previous === undefined || previous === null) {
      return null;
    }
    const diff = Math.round((current - previous) * 10) / 10;
    if (diff === 0) {
      return { value: '0', class: 'delta-neutral', icon: 'fa-minus' };
    }
    const formatted = diff > 0 ? `+${diff}` : `${diff}`;
    const isPositive = diff > 0;
    return {
      value: formatted,
      class: isPositive ? 'delta-positive' : 'delta-negative',
      icon: isPositive ? 'fa-arrow-up' : 'fa-arrow-down'
    };
  }

  private initProgressForm(): void {
    this.measurementForm = this.fb.group({
      weight: [null, [Validators.required, Validators.min(1), Validators.max(300)]],
      height: [null, [Validators.required, Validators.min(1), Validators.max(250)]],
      bodyFatPercentage: [null, [Validators.min(1), Validators.max(80)]],
      bmi: [{ value: null, disabled: true }],
      neck: [null, [Validators.min(1), Validators.max(100)]],
      shoulders: [null, [Validators.min(1), Validators.max(250)]],
      chest: [null, [Validators.min(1), Validators.max(250)]],
      leftBicep: [null, [Validators.min(1), Validators.max(100)]],
      rightBicep: [null, [Validators.min(1), Validators.max(100)]],
      leftForearm: [null, [Validators.min(1), Validators.max(100)]],
      rightForearm: [null, [Validators.min(1), Validators.max(100)]],
      upperAbs: [null, [Validators.min(1), Validators.max(200)]],
      lowerAbs: [null, [Validators.min(1), Validators.max(200)]],
      waist: [null, [Validators.min(1), Validators.max(250)]],
      hips: [null, [Validators.min(1), Validators.max(250)]],
      leftThigh: [null, [Validators.min(1), Validators.max(150)]],
      rightThigh: [null, [Validators.min(1), Validators.max(150)]],
      leftCalf: [null, [Validators.min(1), Validators.max(100)]],
      rightCalf: [null, [Validators.min(1), Validators.max(100)]],
      notes: ['']
    });
  }

  setTrackerMode(mode: 'basic' | 'advanced'): void {
    this.activeTrackerMode = mode;
    if (mode === 'basic') {
      this.measurementForm.patchValue({
        bodyFatPercentage: null,
        neck: null,
        shoulders: null,
        chest: null,
        leftBicep: null,
        rightBicep: null,
        leftForearm: null,
        rightForearm: null,
        upperAbs: null,
        lowerAbs: null,
        waist: null,
        hips: null,
        leftThigh: null,
        rightThigh: null,
        leftCalf: null,
        rightCalf: null
      }, { emitEvent: false });
    }
  }

  toggleLogDetails(logId: string): void {
    this.expandedLogs[logId] = !this.expandedLogs[logId];
  }

  submitProgress(): void {
    if (this.measurementForm.invalid) {
      this.measurementForm.markAllAsTouched();
      return;
    }
    const formVal = this.measurementForm.getRawValue();
    const payload: any = {
      weight: formVal.weight,
      height: formVal.height,
      bmi: formVal.bmi,
      isAdvanced: this.activeTrackerMode === 'advanced',
      notes: formVal.notes
    };

    if (this.activeTrackerMode === 'advanced') {
      payload.bodyFatPercentage = formVal.bodyFatPercentage;
      payload.neck = formVal.neck;
      payload.shoulders = formVal.shoulders;
      payload.chest = formVal.chest;
      payload.leftBicep = formVal.leftBicep;
      payload.rightBicep = formVal.rightBicep;
      payload.leftForearm = formVal.leftForearm;
      payload.rightForearm = formVal.rightForearm;
      payload.upperAbs = formVal.upperAbs;
      payload.lowerAbs = formVal.lowerAbs;
      payload.waist = formVal.waist;
      payload.hips = formVal.hips;
      payload.leftThigh = formVal.leftThigh;
      payload.rightThigh = formVal.rightThigh;
      payload.leftCalf = formVal.leftCalf;
      payload.rightCalf = formVal.rightCalf;
    } else {
      payload.bodyFatPercentage = null;
      payload.neck = null;
      payload.shoulders = null;
      payload.chest = null;
      payload.leftBicep = null;
      payload.rightBicep = null;
      payload.leftForearm = null;
      payload.rightForearm = null;
      payload.upperAbs = null;
      payload.lowerAbs = null;
      payload.waist = null;
      payload.hips = null;
      payload.leftThigh = null;
      payload.rightThigh = null;
      payload.leftCalf = null;
      payload.rightCalf = null;
    }

    this.recordMeasurement.emit(payload);
  }

  getBmiCategoryText(): string {
    const bmi = this.measurementForm?.get('bmi')?.value;
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  getBmiCategoryClass(): string {
    const bmi = this.measurementForm?.get('bmi')?.value;
    if (!bmi) return 'empty';
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  getBmiClass(bmi: number | undefined): string {
    if (!bmi) return 'empty';
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  getBmiText(bmi: number | undefined): string {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }
}
