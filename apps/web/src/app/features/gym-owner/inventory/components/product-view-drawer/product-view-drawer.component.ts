import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlideDrawerComponent } from '../../../../../shared/components/slide-drawer/slide-drawer.component';

@Component({
  selector: 'app-product-view-drawer',
  standalone: true,
  imports: [CommonModule, SlideDrawerComponent],
  templateUrl: './product-view-drawer.component.html',
  styleUrls: ['./product-view-drawer.component.scss']
})
export class ProductViewDrawerComponent {
  @Input() isOpen = false;
  @Input() product: any = null;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() editProduct = new EventEmitter<any>();

  getBadgeClass(status: string): any {
    const s = status?.toLowerCase();
    if (['in stock', 'excellent', 'success', 'active'].includes(s)) return 'badge-success';
    if (['low stock', 'maintenance due', 'pending', 'fair', 'in maintenance'].includes(s)) return 'badge-warning';
    if (['out of stock', 'critical', 'expired', 'repair needed', 'danger'].includes(s)) return 'badge-danger';
    return 'badge-secondary';
  }
}
