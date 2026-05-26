import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PaymentService } from '../../../../../core/services/payment.service';
import { GymSubscriptionStatus } from '../../../../../shared/models/payment.model';

@Component({
  selector: 'app-upi-payment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upi-payment-modal.component.html',
  styleUrl: './upi-payment-modal.component.scss'
})
export class UpiPaymentModalComponent implements OnInit, OnDestroy {
  private notification = inject(NotificationService);
  private paymentService = inject(PaymentService);

  @Input() checkoutPlanName: string = 'GymForge Pro Plan';
  @Input() checkoutPrice: number = 4999;

  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<GymSubscriptionStatus>();

  get qrCodeUrl(): string {
    const encodedUpiUrl = encodeURIComponent(`upi://pay?pa=fitlife@okaxis&pn=GymForge&am=${this.checkoutPrice}&cu=INR`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedUpiUrl}`;
  }

  upiTimer: string = '05:00';
  private upiTimerInterval: any;

  ngOnInit(): void {
    this.startUpiCountdown();
  }

  ngOnDestroy(): void {
    this.clearUpiTimer();
  }

  private clearUpiTimer(): void {
    if (this.upiTimerInterval) {
      clearInterval(this.upiTimerInterval);
    }
  }

  startUpiCountdown(): void {
    let totalSeconds = 300; // 5 minutes
    this.clearUpiTimer();
    this.upiTimer = '05:00';

    this.upiTimerInterval = setInterval(() => {
      totalSeconds--;
      if (totalSeconds <= 0) {
        this.clearUpiTimer();
        this.close.emit();
        this.notification.error('UPI payment request timed out. Please try again.');
        return;
      }
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      this.upiTimer = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
  }

  simulateUpiPaymentSuccess(): void {
    this.notification.info('Authorizing payment with bank UPI gateway...');

    setTimeout(() => {
      this.paymentService.renewSubscription(this.checkoutPlanName, this.checkoutPrice).subscribe({
        next: (res: any) => {
          if (res.data) {
            this.paymentSuccess.emit(res.data);
            this.notification.success(`Payment of ₹${this.checkoutPrice.toLocaleString('en-IN')}.00 processed successfully! Plan updated to ${this.checkoutPlanName}.`);
          }
          this.close.emit();
        },
        error: () => {
          this.notification.error('Failed to process payment verification on server.');
          this.close.emit();
        }
      });
    }, 1500);
  }
}
