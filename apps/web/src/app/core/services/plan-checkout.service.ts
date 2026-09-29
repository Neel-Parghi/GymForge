import { Injectable, NgZone, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentService } from './payment.service';
import { CONSTANTS } from '../constants/constants';
import { PlanCheckoutOutcome, PlanCheckoutRequest, RazorpaySuccessResponse } from '../../shared/models/payment.model';

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', handler: (response: { error?: { description?: string } }) => void): void;
}

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

/**
 * Buys a SaaS plan through Razorpay: create order → Checkout popup → server-side signature verify.
 * The plan is activated by the API only after verification (or by the Razorpay webhook).
 */
@Injectable({ providedIn: 'root' })
export class PlanCheckoutService {
  private paymentService = inject(PaymentService);
  private zone = inject(NgZone);

  checkout(request: PlanCheckoutRequest): Observable<PlanCheckoutOutcome> {
    return new Observable<PlanCheckoutOutcome>(subscriber => {
      const finish = (outcome: PlanCheckoutOutcome) => {
        // Razorpay callbacks run outside Angular; re-enter so the UI updates.
        this.zone.run(() => {
          subscriber.next(outcome);
          subscriber.complete();
        });
      };

      const Razorpay = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!Razorpay) {
        finish({ status: 'failed', message: 'Payment gateway could not be loaded. Check your connection and try again.' });
        return;
      }

      const initiate = this.paymentService.initiatePayment({ gymId: request.gymId, planId: request.planId }).subscribe({
        next: res => {
          const order = res?.data;
          if (!order?.razorpayOrderId) {
            finish({ status: 'failed', message: CONSTANTS.GYM_MODULE.INIT_SUBSCRIPTION_ERROR });
            return;
          }

          // Razorpay keeps the popup open after a failed attempt so the user can retry;
          // only report the failure if they then close it without paying.
          let lastFailure: string | undefined;

          const checkout = new Razorpay({
            key: CONSTANTS.PAYMENT.RAZORPAY.KEY_ID,
            amount: order.amount,
            currency: CONSTANTS.PAYMENT.RAZORPAY.CURRENCY,
            order_id: order.razorpayOrderId,
            name: CONSTANTS.PAYMENT.RAZORPAY.COMPANY_NAME,
            description: request.description,
            prefill: request.prefill ?? {},
            theme: { color: CONSTANTS.PAYMENT.RAZORPAY.THEME_COLOR },
            handler: (response: RazorpaySuccessResponse) => this.verify(response, finish),
            modal: {
              ondismiss: () => finish(lastFailure ? { status: 'failed', message: lastFailure } : { status: 'dismissed' })
            }
          });
          checkout.on('payment.failed', failure => {
            lastFailure = failure?.error?.description || 'Payment failed. No amount was charged.';
          });
          checkout.open();
        },
        error: err => finish({ status: 'failed', message: err?.error?.message || CONSTANTS.GYM_MODULE.INIT_SUBSCRIPTION_ERROR })
      });

      return () => initiate.unsubscribe();
    });
  }

  private verify(response: RazorpaySuccessResponse, finish: (outcome: PlanCheckoutOutcome) => void): void {
    this.paymentService.verifyPayment({
      orderId: response.razorpay_order_id,
      paymentId: response.razorpay_payment_id,
      signature: response.razorpay_signature
    }).subscribe({
      next: () => finish({ status: 'paid' }),
      // The webhook still activates the plan if the payment itself went through.
      error: err => finish({
        status: 'failed',
        message: err?.error?.message || 'We received your payment but could not confirm it yet. It will be applied shortly.'
      })
    });
  }
}
