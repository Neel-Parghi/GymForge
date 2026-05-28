import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PricingService } from '../../../core/services/pricing.service';
import { PaymentService } from '../../../core/services/payment.service';
import { GymService } from '../../../core/services/gym.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PricingPlan } from '../../../shared/models/pricing.model';
import { GymListResponse } from '../../../shared/models/gym.model';

@Component({
  selector: 'app-subscription-expired',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-expired.component.html',
  styleUrl: './subscription-expired.component.scss'
})
export class SubscriptionExpiredComponent implements OnInit {
  private pricingService = inject(PricingService);
  private paymentService = inject(PaymentService);
  private gymService = inject(GymService);
  private authService = inject(AuthApiService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  plans: PricingPlan[] = [];
  gym: GymListResponse | null = null;
  loading = true;
  submittingPlanId: string | null = null;

  ngOnInit(): void {
    this.loadGymAndPlans();
  }

  loadGymAndPlans() {
    this.loading = true;
    this.gymService.getMyGym(true).subscribe({
      next: (gymRes) => {
        this.gym = gymRes?.data || null;
        this.pricingService.getAllPlans(true).subscribe({
          next: (plansRes) => {
            this.plans = plansRes?.data?.filter(p => p.isActive && !p.isTrial) || [];
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectPlan(plan: PricingPlan) {
    this.submittingPlanId = plan.id;
    this.paymentService.renewSubscription(plan.name, plan.price).subscribe({
      next: () => {
        this.notification.success(`Access restored! Successfully subscribed to the ${plan.name}.`);
        this.gymService.clearMyGymCache();
        this.submittingPlanId = null;
        this.router.navigate(['/gym-owner/dashboard']);
      },
      error: (err) => {
        this.notification.error(err?.error?.message || 'Payment initiation failed. Please try again.');
        this.submittingPlanId = null;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
