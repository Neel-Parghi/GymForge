import { FormControl } from '@angular/forms';

export interface ProfileForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phone: FormControl<string>;
  addressLine1: FormControl<string>;
  addressLine2: FormControl<string>;
  city: FormControl<string>;
  state: FormControl<string>;
  zipCode: FormControl<string>;
}

export interface PasswordForm {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

export interface AccountLink {
  label: string;
  hint: string;
  icon: string;
  tone: 'info' | 'good';
  route: string;
}
