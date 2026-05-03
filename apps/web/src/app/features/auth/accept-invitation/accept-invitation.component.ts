import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './accept-invitation.component.html',
  styleUrls: ['./accept-invitation.component.scss']
})
export class AcceptInvitationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  acceptForm: FormGroup;
  token: string | null = null;
  isValidating = true;
  isTokenValid = false;
  isSubmitting = false;
  showPassword = false;
  errorMessage = '';

  constructor() {
    this.acceptForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (this.token) {
      this.validateToken();
    } else {
      this.isValidating = false;
      this.isTokenValid = false;
      this.errorMessage = 'Invalid invitation link. No token provided.';
    }
  }

  validateToken(): void {
    this.userService.validateInvitation(this.token!).subscribe({
      next: (res: any) => {
        const data = res?.Data || res?.data || res;
        this.isValidating = false;
        this.isTokenValid = data.isValid;
        if (!this.isTokenValid) {
          this.errorMessage = 'This invitation link has expired or is no longer valid.';
        }
      },
      error: () => {
        this.isValidating = false;
        this.isTokenValid = false;
        this.errorMessage = 'An error occurred while validating your invitation. Please try again later.';
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.acceptForm.valid && this.token) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const payload = {
        token: this.token,
        password: this.acceptForm.value.password,
        confirmPassword: this.acceptForm.value.confirmPassword
      };

      this.userService.setPassword(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          // Redirect to login with a success message (could use a snackbar/toast here)
          this.router.navigate(['/login'], { queryParams: { setupSuccess: true } });
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Failed to set password. Please try again.';
        }
      });
    }
  }
}
