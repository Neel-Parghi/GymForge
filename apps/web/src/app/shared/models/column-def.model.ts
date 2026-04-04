export interface ColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'action' | 'badge';
  isClickable?: boolean;
}
