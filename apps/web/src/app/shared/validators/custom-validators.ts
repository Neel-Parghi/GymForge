import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selectedDate > today ? { futureDate: true } : null;
}
