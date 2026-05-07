import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDef } from '../../models/column-def.model';
import { DropdownOption } from '../../models/dropdown.model';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-grid.component.html',
  styleUrl: './data-grid.component.scss',
})
export class DataGrid {
  @ContentChild('emptyState') emptyStateTemplate?: TemplateRef<any>;
  @Input() config!: { columns: ColumnDef[], selectable?: boolean };
  @Input() data: any[] = [];
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;

  @Output() actionEvent = new EventEmitter<{ action: string, row: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get columns() { return this.config?.columns || []; }
  get selectable() { return this.config?.selectable || false; }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get startRange(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRange(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  selectedRows: any[] = [];

  ngOnInit() {
  }

  readonly pageSizeOptions: DropdownOption[] = [
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 }
  ];

  onPageSizeChange(size: any) {
    const newSize = typeof size === 'object' ? +(size.target as HTMLSelectElement).value : size;
    this.pageSizeChange.emit(newSize);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onAction(action: string, row: any) {
    this.actionEvent.emit({ action, row });
  }

  toggleSelection(row: any, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(r => r !== row);
    }
    this.selectionChange.emit(this.selectedRows);
  }

  toggleAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedRows = [...(this.data || [])];
    } else {
      this.selectedRows = [];
    }
    this.selectionChange.emit(this.selectedRows);
  }

  isAllSelected() {
    return this.data?.length > 0 && this.selectedRows.length === this.data.length;
  }

  isSelected(row: any) {
    return this.selectedRows.includes(row);
  }

  getBadgeClass(status: string): string {
    if (!status) return 'badge-neutral';
    const s = status.toLowerCase();
    switch (s) {
      case 'active':
      case 'accepted':
      case 'success':
      case 'paid':
        return 'badge-active';
      case 'pending':
      case 'partial':
        return 'badge-pending';
      case 'unpaid':
      case 'refunded':
        return 'badge-unpaid';
      case 'frozen':
        return 'badge-neutral';
      case 'inactive':
      case 'expired':
      case 'failed':
        return 'badge-inactive';
      default:
        return 'badge-neutral';
    }
  }

  getNestedValue(row: any, key: string): any {
    if (!row || !key) return '';
    if (!key.includes('.')) return row[key] ?? '';
    return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : '', row) || '';
  }
}
