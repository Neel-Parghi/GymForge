import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-member-detail-health-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './member-detail-health-tracker.html',
  styleUrl: './member-detail-health-tracker.scss',
})
export class PTMemberDetailHealthTrackerComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() measurements: any[] = [];
  @Input() isLoadingLogs = false;
  @Input() isSubmittingProgress = false;

  @Output() recordMeasurement = new EventEmitter<any>();

  measurementForm!: FormGroup;

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
    }
  }

  private initProgressForm(): void {
    this.measurementForm = this.fb.group({
      weight: [null, [Validators.required, Validators.min(20), Validators.max(300)]],
      height: [null, [Validators.required, Validators.min(50), Validators.max(250)]],
      bodyFatPercentage: [null, [Validators.min(1), Validators.max(80)]],
      bmi: [{ value: null, disabled: true }],
      notes: ['']
    });
  }

  submitProgress(): void {
    if (this.measurementForm.invalid) {
      this.measurementForm.markAllAsTouched();
      return;
    }
    const formVal = this.measurementForm.getRawValue();
    this.recordMeasurement.emit(formVal);
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
