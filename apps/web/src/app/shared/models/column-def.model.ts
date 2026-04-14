export interface ColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'action' | 'badge' | 'date' | 'number';
  isClickable?: boolean;
}
