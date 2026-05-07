import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slide-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slide-drawer.component.html',
  styleUrl: './slide-drawer.component.scss'
})
export class SlideDrawerComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() width = '500px';

  @Output() closeDrawer = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapeKeydown() {
    if (this.isOpen) {
      this.close();
    }
  }

  close() {
    this.closeDrawer.emit();
  }

  onDrawerClick(event: Event) {
    event.stopPropagation();
  }
}
