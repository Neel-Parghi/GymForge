import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule]
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

  isOtpStep = false;
  otpCode = '';
  registeredEmail = '';
  resendCooldown = 0;
  resendTimer: any;

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
        next: (res) => {
          if (res?.requiresOtp) {
            this.isOtpStep = true;
            this.registeredEmail = res.email;
            this.notification.success(res.message || 'OTP sent successfully.');
            this.startResendCooldown();
          } else {
            this.notification.success(CONSTANTS.AUTH.REGISTER_SUCCESS);
            this.authApiService.redirectUserByRole();
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.notification.error(err.error?.message || CONSTANTS.AUTH.REGISTER_FAILED);
          this.isLoading = false;
        },
      });
    }
  }

  verifyOtp() {
    if (this.otpCode.length === 6) {
      this.isLoading = true;
      this.authApiService.verifyOtp({ email: this.registeredEmail, otpCode: this.otpCode }).subscribe({
        next: () => {
          this.notification.success('Email verified successfully!');
          this.authApiService.redirectUserByRole();
          this.isLoading = false;
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Verification failed.');
          this.isLoading = false;
        }
      });
    }
  }

  resendOtp() {
    if (this.resendCooldown > 0) return;

    this.isLoading = true;
    this.authApiService.resendOtp({ email: this.registeredEmail }).subscribe({
      next: (res) => {
        this.notification.success(res?.message || 'OTP resent successfully.');
        this.startResendCooldown();
        this.isLoading = false;
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Failed to resend OTP.');
        this.isLoading = false;
      }
    });
  }

  startResendCooldown() {
    this.resendCooldown = 60;
    if (this.resendTimer) clearInterval(this.resendTimer);

    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.resendTimer) clearInterval(this.resendTimer);
  }
}

