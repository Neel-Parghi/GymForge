import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlideDrawerComponent } from '../../../../../shared/components/slide-drawer/slide-drawer.component';

@Component({
  selector: 'app-equipment-view-drawer',
  standalone: true,
  imports: [CommonModule, SlideDrawerComponent],
  templateUrl: './equipment-view-drawer.component.html',
  styleUrls: ['./equipment-view-drawer.component.scss']
})
export class EquipmentViewDrawerComponent {
  @Input() isOpen = false;
  @Input() equipment: any = null;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() editEquipment = new EventEmitter<any>();

  getBadgeClass(status: string): any {
    const s = status?.toLowerCase();
    if (['in stock', 'excellent', 'success', 'active'].includes(s)) return 'badge-success';
    if (['low stock', 'maintenance due', 'pending', 'fair', 'in maintenance'].includes(s)) return 'badge-warning';
    if (['out of stock', 'critical', 'expired', 'repair needed', 'danger'].includes(s)) return 'badge-danger';
    return 'badge-secondary';
  }
}
