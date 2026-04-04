import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { ToastrService } from 'ngx-toastr';

@Component({

  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authApiService = inject(AuthApiService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

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
          const token = response?.Data?.token || response?.token;
          if (token) {
            this.authApiService.saveToken(token);
            this.toastr.success('Login successful!');
            this.authApiService.redirectUserByRole();
          } else {
            console.error('No token received from login API', response);
            this.toastr.error('Authentication failed. No token received.');
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Login failed. Please try again.');
          this.isLoading = false;
        },
      });
    }
  }
}
