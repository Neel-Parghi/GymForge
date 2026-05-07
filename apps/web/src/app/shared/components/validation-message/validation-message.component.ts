import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  imports: [],
  templateUrl: './validation-message.component.html',
  styleUrl: './validation-message.component.scss',
})
export class ValidationMessage {
  @Input({ required: true }) control!: AbstractControl | null;
  @Input() fieldName: string = 'This field';

  get errorMessage(): string | null {
    if (!this.control || !this.control.errors) {
      return null;
    }
    if (this.control.errors['required']) {
      return `${this.fieldName} is required`;
    }
    if (this.control.errors['email']) {
      return `${this.fieldName} must be a valid email`;
    }
    if (this.control.errors['minlength']) {
      return `${this.fieldName} must be at least ${this.control.errors['minlength'].requiredLength} characters long`;
    }
    if (this.control.errors['maxlength']) {
      return `${this.fieldName} must be at most ${this.control.errors['maxlength'].requiredLength} characters long`;
    }
    if (this.control.errors['pattern']) {
      return `${this.fieldName} must match the pattern ${this.control.errors['pattern'].pattern}`;
    }
    if (this.control.errors['min']) {
      return `${this.fieldName} must be at least ${this.control.errors['min'].min}`;
    }
    if (this.control.errors['max']) {
      return `${this.fieldName} cannot exceed ${this.control.errors['max'].max}`;
    }
    return 'Invalid input';
  }
}
