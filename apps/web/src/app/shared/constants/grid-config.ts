import { GridConfigDef } from '../models/grid-config.model';

export const AppGridConfig: Record<string, GridConfigDef> = {
  GymList: {
    columns: [
      { key: 'gymName', label: 'Gym Name', isClickable: true },
      { key: 'brandName', label: 'Brand / Franchise' },
      { key: 'ownerName', label: 'Owner' },
      { key: 'email', label: 'Contact Email' },
      { key: 'branchesCount', label: 'Branches' },
      { key: 'isVerified', label: 'Verification', type: 'badge' },
      { key: 'isActive', label: 'Status', type: 'bool' },
      { key: 'actions', label: 'Manage', type: 'action' }
    ],
    selectable: true
  },
  GymOwners: {
    columns: [
      { key: 'name', label: 'Owner Name', isClickable: true },
      { key: 'email', label: 'Email' },
      { key: 'joinedDate', label: 'Joined Date', type: 'date' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'gymsOwned', label: 'Gyms Owned' },
      { key: 'invitationStatus', label: 'Invite Status', type: 'badge' },
      { key: 'status', label: 'Status', type: 'bool' },
      { key: 'actions', label: 'Actions', type: 'action' }
    ],
    selectable: true
  },
  PricingList: {
    columns: [
      { key: 'name', label: 'Plan Name', isClickable: true },
      { key: 'description', label: 'Description' },
      { key: 'durationInDays', label: 'Duration (Days)', type: 'number' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'maxBranches', label: 'Max Branches', type: 'number' },
      { key: 'maxMembers', label: 'Max Members', type: 'number' },
      // { key: 'createdAt', label: 'Created Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'isTrial', label: 'Trial', type: 'bool' },
      { key: 'actions', label: 'Actions', type: 'action' }
    ],
    selectable: true
  },
  PaymentList: {
    columns: [
      { key: 'gymName', label: 'Gym Name' },
      { key: 'planName', label: 'Plan' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'paymentDate', label: 'Payment Date', type: 'date' },
      { key: 'createdOn', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'gatewayTransactionId', label: 'Transaction ID' },
    ],
    selectable: false
  }
};
