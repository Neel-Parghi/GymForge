import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlideDrawerComponent } from '../../../../../shared/components/slide-drawer/slide-drawer.component';

@Component({
  selector: 'app-maintenance-view-drawer',
  standalone: true,
  imports: [CommonModule, SlideDrawerComponent],
  templateUrl: './maintenance-view-drawer.component.html',
  styleUrls: ['./maintenance-view-drawer.component.scss']
})
export class MaintenanceViewDrawerComponent {
  @Input() isOpen = false;
  @Input() selectedMaintenanceLog: any = null;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() editLog = new EventEmitter<any>();

  getBadgeClass(status: string): any {
    const s = status?.toLowerCase();
    if (['in stock', 'excellent', 'success', 'active', 'completed'].includes(s)) return 'badge-success';
    if (['low stock', 'maintenance due', 'pending', 'fair', 'in maintenance', 'in progress', 'scheduled'].includes(s)) return 'badge-warning';
    if (['out of stock', 'critical', 'expired', 'repair needed', 'danger'].includes(s)) return 'badge-danger';
    return 'badge-secondary';
  }
}
