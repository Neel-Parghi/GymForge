import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authApiService = inject(AuthApiService);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('setupSuccess') === 'true') {
      this.notification.success(CONSTANTS.AUTH.PASSWORD_SET_SUCCESS);
    }
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(30),
      Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/)
    ]],
    rememberMe: [false]
  });

  showPassword = false;
  isLoading = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { rememberMe, ...credentials } = this.loginForm.value;
      this.authApiService.login(credentials, rememberMe ?? false).subscribe({
        next: (response) => {
          const data = response?.data || response;
          const token = data?.accessToken;
          if (token) {
            // Parse token to check onboarding status
            const decodedToken = this.authApiService.decodeToken();
            const isOnboarded = decodedToken?.isOnboarded === 'True' || decodedToken?.isOnboarded === true;
            const role = decodedToken?.role || decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            if (!isOnboarded && role !== 'SuperAdmin') {
              this.notification.info('Complete the onboarding');
            } else {
              this.notification.success(CONSTANTS.AUTH.LOGIN_SUCCESS);
            }

            this.authApiService.redirectUserByRole();
          } else {
            console.error('No token received from login API', response);
            this.notification.error(CONSTANTS.AUTH.LOGIN_FAILED);
          }
          this.isLoading = false;
        },
        error: (err) => {
          const errorMessage = err.error?.message || CONSTANTS.AUTH.LOGIN_ERROR;
          if (errorMessage === 'EMAIL_NOT_VERIFIED') {
            this.notification.error('Your email is not verified. Please register again to receive a new verification code.');
          } else {
            this.notification.error(errorMessage);
          }
          this.isLoading = false;
        },
      });
    }
  }
}
