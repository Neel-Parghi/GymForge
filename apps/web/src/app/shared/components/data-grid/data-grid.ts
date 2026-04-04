import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDef } from '../../models/column-def.model';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-grid.html',
  styleUrl: './data-grid.scss',
})
export class DataGrid {
  @Input() config!: { columns: ColumnDef[], selectable?: boolean };
  @Input() data: any[] = [];

  get columns() { return this.config?.columns || []; }
  get selectable() { return this.config?.selectable || false; }
  @Output() actionEvent = new EventEmitter<{ action: string, row: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();

  selectedRows: any[] = [];

  ngOnInit() {
    console.log(this.config)
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
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }
    this.selectionChange.emit(this.selectedRows);
  }

  isAllSelected() {
    return this.data.length > 0 && this.selectedRows.length === this.data.length;
  }

  isSelected(row: any) {
    return this.selectedRows.includes(row);
  }
}
