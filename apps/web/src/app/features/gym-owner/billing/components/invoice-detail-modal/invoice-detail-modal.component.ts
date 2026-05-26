import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-invoice-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-detail-modal.component.html',
  styleUrl: './invoice-detail-modal.component.scss'
})
export class InvoiceDetailModalComponent {
  private notification = inject(NotificationService);

  @Input() invoice!: any;
  @Input() gymDetails: any = null;
  @Input() invoicePrefix: string = 'GF-';

  @Output() close = new EventEmitter<void>();

  isSaaSInvoice(invoice: any): boolean {
    return !!invoice && (!!invoice.planName || invoice.id?.toString().includes('SaaS') || invoice.id?.toString().startsWith('pay_'));
  }

  getTaxableAmount(amount: number, taxRate: number = 18): number {
    return amount / (1 + (taxRate / 100));
  }

  getTaxAmount(amount: number, taxRate: number = 18): number {
    return amount - this.getTaxableAmount(amount, taxRate);
  }

  getFormattedInvoiceId(invoice: any): string {
    if (!invoice?.id) return '';

    if (invoice.planName || invoice.billingDate) {
      return invoice.id;
    }

    const rawId = invoice.id.toString();
    if (rawId.startsWith(this.invoicePrefix)) {
      return rawId;
    }

    const displayId = rawId.length > 8 ? rawId.substring(0, 8).toUpperCase() : rawId.toUpperCase();
    return `${this.invoicePrefix}${displayId}`;
  }

  downloadInvoicePdf(invoice: any, event: Event): void {
    event.stopPropagation();

    setTimeout(() => {
      const printableElement = document.getElementById('printable-receipt');
      if (!printableElement) {
        this.notification.error('Failed to locate print receipt template.');
        return;
      }

      // Create absolute hidden iframe
      const printFrame = document.createElement('iframe');
      printFrame.setAttribute('style', 'position: absolute; width: 1024px; height: 768px; top: -9999px; left: -9999px; visibility: hidden;');

      printFrame.onload = () => {
        printFrame.contentWindow?.postMessage({
          type: 'PRINT_INVOICE',
          invoiceId: invoice.id || '',
          html: printableElement.innerHTML
        }, '*');
      };

      printFrame.src = '/assets/templates/invoice-print.html';
      document.body.appendChild(printFrame);

      const handlePrintComplete = (msgEvent: MessageEvent) => {
        if (msgEvent.data && msgEvent.data.type === 'PRINT_COMPLETE') {
          if (printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }
          window.removeEventListener('message', handlePrintComplete);
          this.notification.success(`PDF receipt generated for ${invoice.id || invoice.memberName || 'GymForge License'}.`);
        }
      };

      window.addEventListener('message', handlePrintComplete);
    }, 50);
  }
}
