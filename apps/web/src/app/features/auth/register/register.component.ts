import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authApiService = inject(AuthApiService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showPassword = false;
  isLoading = false;
  selectedRole = 'GymOwner'; // default

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  setRole(role: string) {
    this.selectedRole = role;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      const formValue = this.registerForm.value;
      const nameParts = (formValue.name || '').trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const payload = {
        firstName,
        lastName,
        email: formValue.email,
        password: formValue.password,
        role: this.selectedRole
      };

      this.authApiService.register(payload).subscribe({
        next: () => {
          this.notification.success(CONSTANTS.AUTH.REGISTER_SUCCESS);
          // Instead of routing to login, since we auto-login, navigate to correct dashboard
          this.authApiService.redirectUserByRole();
          this.isLoading = false;
        },
        error: (err) => {
          this.notification.error(err.error?.message || CONSTANTS.AUTH.REGISTER_FAILED);
          this.isLoading = false;
        },
      });
    }
  }
}
