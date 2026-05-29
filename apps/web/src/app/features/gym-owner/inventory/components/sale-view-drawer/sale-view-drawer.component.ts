import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlideDrawerComponent } from '../../../../../shared/components/slide-drawer/slide-drawer.component';
import { InventoryService } from '../../../../../core/services/inventory.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CONSTANTS } from '../../../../../core/constants/constants';

@Component({
  selector: 'app-sale-view-drawer',
  standalone: true,
  imports: [CommonModule, SlideDrawerComponent],
  templateUrl: './sale-view-drawer.component.html',
  styleUrls: ['./sale-view-drawer.component.scss']
})
export class SaleViewDrawerComponent {
  private inventoryService = inject(InventoryService);
  private notificationService = inject(NotificationService);

  @Input() isOpen = false;
  @Input() selectedSale: any = null;

  @Output() closeDrawer = new EventEmitter<void>();

  loading = false;

  printReceipt() {
    if (!this.selectedSale) return;
    this.notificationService.success(CONSTANTS.INVENTORY_MODULE.RECEIPT_PRINTER_INFO);
    window.print();
  }

  emailReceipt() {
    if (!this.selectedSale) return;
    this.loading = true;
    this.inventoryService.sendReceiptEmail(this.selectedSale.id).subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.INVENTORY_MODULE.RECEIPT_EMAIL_SUCCESS.replace('{name}', this.selectedSale.memberName));
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to email receipt');
        this.loading = false;
      }
    });
  }
}
