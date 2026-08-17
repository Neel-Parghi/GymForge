import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../shared/models/dropdown.model';

@Component({
  selector: 'app-freeze-member-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './freeze-member-modal.component.html',
  styleUrl: './freeze-member-modal.component.scss'
})
export class FreezeMemberModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<Date>();

  readonly durationOptions: DropdownOption[] = [
    { label: '1 Week', value: 7 },
    { label: '2 Weeks', value: 14 },
    { label: '1 Month', value: 30 },
    { label: '3 Months', value: 90 },
    { label: 'Custom', value: 'custom' }
  ];

  form: FormGroup = this.fb.group({
    duration: [7, Validators.required],
    customDays: ['', [Validators.min(1), Validators.max(365)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.form.reset({ duration: 7, customDays: '' });
    }
  }

  get isCustom(): boolean {
    return this.form.get('duration')?.value === 'custom';
  }

  get resolvedDays(): number {
    const duration = this.form.get('duration')?.value;
    if (duration === 'custom') {
      return Number(this.form.get('customDays')?.value) || 0;
    }
    return Number(duration) || 0;
  }

  get freezeUntilDate(): Date {
    const d = new Date();
    d.setDate(d.getDate() + this.resolvedDays);
    return d;
  }

  get isValid(): boolean {
    return this.resolvedDays > 0 && this.resolvedDays <= 365;
  }

  onConfirm(): void {
    if (!this.isValid) return;
    this.confirm.emit(this.freezeUntilDate);
  }

  onCancel(): void {
    this.close.emit();
  }
}
