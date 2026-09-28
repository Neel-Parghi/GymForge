import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FIELD_LIMITS, FIELD_PATTERNS } from '../constants/validation.constants';

export function noFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selectedDate > today ? { futureDate: true } : null;
}

/** Builds a validator that tests a non-empty value against a regex and reports `{ [key]: true }` on mismatch. */
function patternValidator(key: string, pattern: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;
    return pattern.test(String(value).trim()) ? null : { [key]: true };
  };
}

export const phoneValidator = patternValidator('phone', FIELD_PATTERNS.PHONE);

export const urlValidator = patternValidator('url', FIELD_PATTERNS.URL);

export const gstValidator = patternValidator('gst', FIELD_PATTERNS.GST_NUMBER);

export const postalCodeValidator = patternValidator('postalCode', FIELD_PATTERNS.POSTAL_CODE);

export const registrationNumberValidator = patternValidator('registrationNumber', FIELD_PATTERNS.REGISTRATION_NUMBER);

export const passwordStrengthValidator = patternValidator('passwordStrength', FIELD_PATTERNS.PASSWORD_STRENGTH);

/** Rules for choosing a new password; matches the register form and the login max length. */
export const newPasswordValidators: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(FIELD_LIMITS.PASSWORD_MIN),
  Validators.maxLength(FIELD_LIMITS.PASSWORD_MAX),
  passwordStrengthValidator
];

/** Rules for an existing / confirmation password, where strength is enforced elsewhere. */
export const existingPasswordValidators: ValidatorFn[] = [
  Validators.required,
  Validators.maxLength(FIELD_LIMITS.PASSWORD_MAX)
];
