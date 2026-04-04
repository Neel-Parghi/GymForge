import { GridConfigDef } from '../models/grid-config.model';

export const AppGridConfig: Record<string, GridConfigDef> = {
  GymList: {
    columns: [
      { key: 'id', label: 'Gym ID', isClickable: true },
      { key: 'name', label: 'Gym Name' },
      { key: 'location', label: 'Location' },
      { key: 'members', label: 'Total Members' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'actions', label: 'Manage', type: 'action' }
    ],
    selectable: true
  },
  GymOwners: {
    columns: [
      { key: 'id', label: 'ID', isClickable: true },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'actions', label: 'Actions', type: 'action' }
    ],
    selectable: true
  }
};
