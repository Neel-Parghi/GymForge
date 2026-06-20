import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-health-tracker-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './health-tracker-form.component.html',
  styleUrl: './health-tracker-form.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    style: 'display: contents;'
  }
})
export class HealthTrackerFormComponent {
  @Input() measurementForm!: FormGroup;
  @Input() activeTrackerMode: 'basic' | 'advanced' = 'basic';
  @Input() isSubmittingProgress = false;

  @Output() changeMode = new EventEmitter<'basic' | 'advanced'>();
  @Output() cancel = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<void>();

  setTrackerMode(mode: 'basic' | 'advanced'): void {
    this.changeMode.emit(mode);
  }

  submitProgress(): void {
    this.submitForm.emit();
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
}
