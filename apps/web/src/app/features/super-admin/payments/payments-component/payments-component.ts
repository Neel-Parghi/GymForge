import { Component, inject, OnInit } from '@angular/core';
import { PaymentService } from '../../../../core/services/payment.service';
import { PaymentStats, PaymentTransaction } from '../../../../shared/models/payment.model';
import { CommonModule } from '@angular/common';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { AppGridConfig } from '../../../../shared/constants/grid-config';

declare var Razorpay: any;

@Component({
  selector: 'app-payments-component',
  standalone: true,
  imports: [CommonModule, DataGrid],
  templateUrl: './payments-component.html',
  styleUrl: './payments-component.scss',
})
export class PaymentsComponent implements OnInit {

  private paymemtService = inject(PaymentService);

  activeTab: 'overview' | 'transactions' | 'settings' = 'overview';

  stats?: PaymentStats;
  transactions: PaymentTransaction[] = [];

  gridConfig = AppGridConfig["PaymentList"];

  // Pagination state
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  ngOnInit() {
    this.loadStats();
    this.loadTransactions();
  }

  payWithRazorpay() {
    const request = {
      gymId: 'D12A6715-0A12-420D-820A-95F9164C2A41',
      planId: '61F24E23-40AD-470E-C92B-08DE9B4B6744'
    };

    this.paymemtService.initiatePayment(request).subscribe({
      next: (res: any) => {
        const options = {
          key: 'rzp_test_SgEiEY7pGSwfkM',
          amount: 49900,
          currency: 'INR',
          order_id: res.Data.razorpayOrderId,
          name: 'GymForge SaaS',
          description: 'Testing 0 to 100 Payment Flow',
          handler: (response: any) => {
            console.log('Razorpay Success Response:', response);
            this.verifyPayment(response.razorpay_order_id, response.razorpay_payment_id);
          },
          prefill: {
            name: 'Neel Parghi',
            email: 'test@example.com'
          },
          theme: { color: '#0f172a' }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    });

  }

  verifyPayment(orderId: string, paymentId: string) {
    this.paymemtService.verifyPayment({
      orderId: orderId,
      paymentId: paymentId
    }).subscribe({
      next: () => {
        alert('SUCCESS! Payment verified and Subscription activated.');
        this.loadStats();
        this.loadTransactions();
      },
      error: (err) => alert('Payment verification failed!')
    });
  }

  loadStats() {
    this.paymemtService.getStats().subscribe({
      next: (res) => {
        this.stats = res.Data;
      }
    })
  }

  loadTransactions() {
    this.paymemtService.getTransactions().subscribe({
      next: (res) => {
        this.transactions = res.Data;
      }
    });
  }

  setActiveTab(tab: 'overview' | 'transactions' | 'settings') {
    this.activeTab = tab;
  }

  onSelectionChange($event: any[]) {
    throw new Error('Method not implemented.');
  }
  handleAction($event: { action: string; row: any; }) {
    throw new Error('Method not implemented.');
  }
  onPageChanged($event: number) {
    throw new Error('Method not implemented.');
  }
  onPageSizeChanged($event: number) {
    throw new Error('Method not implemented.');
  }
}
