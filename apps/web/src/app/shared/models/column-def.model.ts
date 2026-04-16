export interface ColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'action' | 'badge' | 'date' | 'number' | 'currency' | 'bool';
  isClickable?: boolean;
}
