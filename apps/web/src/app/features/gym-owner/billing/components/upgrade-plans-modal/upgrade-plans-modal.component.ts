import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GymSubscriptionStatus } from '../../../../../shared/models/payment.model';
import { PricingPlan } from '../../../../../shared/models/pricing.model';

@Component({
  selector: 'app-upgrade-plans-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade-plans-modal.component.html',
  styleUrl: './upgrade-plans-modal.component.scss'
})
export class UpgradePlansModalComponent {
  @Input() subscriptionStatus: GymSubscriptionStatus | null = null;
  @Input() availablePlans: PricingPlan[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() selectPlan = new EventEmitter<{ planName: string, price: number }>();
}
