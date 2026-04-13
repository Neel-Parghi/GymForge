import { GridConfigDef } from '../models/grid-config.model';

export const AppGridConfig: Record<string, GridConfigDef> = {
  GymList: {
    columns: [
      { key: 'gymName', label: 'Gym Name', isClickable: true },
      { key: 'brandName', label: 'Brand / Franchise' },
      { key: 'ownerName', label: 'Owner' },
      { key: 'contact', label: 'Contact Email' },
      { key: 'branchesCount', label: 'Branches' },
      { key: 'verification', label: 'Verification', type: 'badge' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'actions', label: 'Manage', type: 'action' }
    ],
    selectable: true
  },
  GymOwners: {
    columns: [
      { key: 'name', label: 'Owner Name', isClickable: true },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'gymsOwned', label: 'Gyms Owned' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'actions', label: 'Actions', type: 'action' }
    ],
    selectable: true
  }
};
