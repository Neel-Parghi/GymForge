import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('setupSuccess') === 'true') {
      this.notification.success(CONSTANTS.AUTH.PASSWORD_SET_SUCCESS);
    }
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showPassword = false;
  isLoading = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authApiService.login(this.loginForm.value).subscribe({
        next: (response) => {
          const data = response?.data || response;
          const token = data?.accessToken;
          if (token) {
            this.notification.success(CONSTANTS.AUTH.LOGIN_SUCCESS);
            this.authApiService.redirectUserByRole();
          } else {
            console.error('No token received from login API', response);
            this.notification.error(CONSTANTS.AUTH.LOGIN_FAILED);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.notification.error(err.error?.message || CONSTANTS.AUTH.LOGIN_ERROR);
          this.isLoading = false;
        },
      });
    }
  }
}
