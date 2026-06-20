import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  showNewPassword = false;
  showConfirmPassword = false;
  email = '';
  token = '';
  isInvalidLink = false;

  constructor(
    private fb: FormBuilder,
    private authApi: AuthApiService,
    private notification: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';

      if (!this.email || !this.token) {
        this.isInvalidLink = true;
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetPassword() {
    if (this.resetForm.invalid || this.isInvalidLink) return;
    this.isLoading = true;

    const payload = {
      email: this.email,
      token: this.token,
      newPassword: this.resetForm.value.newPassword,
      confirmPassword: this.resetForm.value.confirmPassword
    };

    this.authApi.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.notification.success('Password reset successfully! Please log in with your new password.');
        
        // Log user out fully locally
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');

        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.data?.message || err?.error?.message || 'Invalid or expired reset link.';
        this.notification.error(msg);
      }
    });
  }
}
