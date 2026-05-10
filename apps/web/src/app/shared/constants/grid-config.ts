import { GridConfigDef } from '../models/grid-config.model';

export const AppGridConfig: Record<string, GridConfigDef> = {
  GymList: {
    columns: [
      { key: 'gymName', label: 'Gym Name', isClickable: true },
      { key: 'brandName', label: 'Brand / Franchise' },
      { key: 'ownerName', label: 'Owner' },
      { key: 'planName', label: 'Current Plan' },
      { key: 'paymentStatus', label: 'Payment', type: 'badge' },
      { key: 'branchesCount', label: 'Branches' },
      { key: 'isVerified', label: 'Verification', type: 'bool' },
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
      { key: 'createdAt', label: 'Payment Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'gatewayTransactionId', label: 'Transaction ID' },
    ],
    selectable: false
  },
  GymMembers: {
    columns: [
      { key: 'firstName', label: 'Member', type: 'profile', subKey: 'email' },
      { key: 'membershipNumber', label: 'Membership ID', type: 'text' },
      { key: 'currentSubscription.planNameSnapshot', label: 'Plan', type: 'complex', subKey: 'currentSubscription.pricePaid' },
      { key: 'joiningDate', label: 'Joined', type: 'date' },
      { key: 'statusLabel', label: 'Status', type: 'badge' },
      { key: 'currentSubscription.paymentStatusLabel', label: 'Payment', type: 'badge' },
      { key: 'currentSubscription.endDate', label: 'Expiry', type: 'date' },
      { key: 'actions', label: 'Actions', type: 'action' }
    ],
    selectable: false
  },
  StaffList: {
    columns: [
      { key: 'fullName', label: 'Name', isClickable: true },
      { key: 'staffNumber', label: 'Staff ID' },
      { key: 'email', label: 'Email' },
      { key: 'phoneNumber', label: 'Phone' },
      { key: 'roleName', label: 'Role', type: 'badge' },
      { key: 'joiningDate', label: 'Joined', type: 'date' },
      { key: 'isActive', label: 'Status', type: 'bool' },
      { key: 'actions', label: 'Actions', type: 'action' }
    ],
    selectable: true
  },
  InventoryItems: {
    columns: [
      { key: 'name', label: 'Product', type: 'profile', subKey: 'sku' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'stockQuantity', label: 'Qty in Stock', type: 'number' },
      { key: 'sellingPrice', label: 'Unit Price', type: 'currency' },
      { key: 'stockStatus', label: 'Availability', type: 'badge' },
      { key: 'actions', label: 'Actions', type: 'action' }
    ],
    selectable: false,
    isRowClickable: true
  },
  EquipmentItems: {
    columns: [
      { key: 'name', label: 'Equipment', type: 'profile', subKey: 'category' },
      { key: 'condition', label: 'Condition', type: 'text' },
      { key: 'lastService', label: 'Last Service', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'actions', label: 'Actions', type: 'action' }
    ],
    selectable: false,
    isRowClickable: true
  },
  MaintenanceTasks: {
    columns: [
      { key: 'name', label: 'Equipment Asset', type: 'profile', subKey: 'serialNumber' },
      { key: 'health', label: 'Health Status', type: 'progress' },
      { key: 'lastService', label: 'Last Serviced', type: 'date' },
      { key: 'status', label: 'Current Status', type: 'badge' },
      { key: 'actions', label: 'Record Service', type: 'action' }
    ],
    selectable: false,
    isRowClickable: true
  },
  SalesHistory: {
    columns: [
      { key: 'memberName', label: 'Member', type: 'profile', subKey: 'memberId' },
      { key: 'productName', label: 'Product', type: 'text' },
      { key: 'quantity', label: 'Qty', type: 'number' },
      { key: 'totalAmount', label: 'Total', type: 'currency' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'paymentMethod', label: 'Method', type: 'badge' },
      { key: 'actions', label: 'Actions', type: 'action' }
    ],
    selectable: false,
    isRowClickable: true
  },
  ServiceHistory: {
    columns: [
      { key: 'equipmentName', label: 'Equipment', type: 'text' },
      { key: 'serviceType', label: 'Type', type: 'badge' },
      { key: 'technicianName', label: 'Technician', type: 'text' },
      { key: 'startDate', label: 'Date', type: 'date' },
      { key: 'cost', label: 'Cost', type: 'currency' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'actions', label: 'Actions', type: 'action' }
    ],
    selectable: false,
    isRowClickable: true
  }
};
