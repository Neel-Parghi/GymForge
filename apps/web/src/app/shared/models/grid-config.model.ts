import { ColumnDef } from './column-def.model';

export interface GridConfigDef {
  columns: ColumnDef[];
  selectable?: boolean;
  isRowClickable?: boolean;
  excludeActions?: string[];
}
