export interface PaymentTransaction {
  id: string;
  gymName: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  gatewayTransactionId: string;
}

export interface PaymentStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
}

export interface CreatePaymentRequest {
  gymId: string;
  planId: string;
}

export interface SaaSConfiguration {
  id: string;
  platformName: string;
  billingEmail: string;
  taxPercentage: number;
  gracePeriodDays: number;
  currency: string;
  billingAddress?: string;
  gstNo?: string;
  supportPhone?: string;
}

export interface MemberInvoice {
  id: string;
  memberName: string;
  email: string;
  initials: string;
  type: 'Membership Renewal' | 'Store Purchase' | 'Personal Training' | 'Registration' | 'Rehab & Therapy' | 'Other Charges';
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Refunded';
  paymentMethod: string;
  dateIssued: Date;
  dueDate: Date;
  itemName: string;
  taxRate: number;
  membershipNumber?: string;
  realRecordId?: string;

  // Dynamic Branch Information
  branchId?: string;
  branchName?: string;
  branchLine1?: string;
  branchLine2?: string;
  branchCity?: string;
  branchState?: string;
  branchPostalCode?: string;
}

export interface PlatformInvoice {
  id: string;
  planName: string;
  amount: number;
  status: 'Paid' | 'Failed';
  billingDate: Date;
}

export interface StaffPayout {
  id: string;
  staffId?: string;
  staffName: string;
  role: string;
  email: string;
  initials: string;
  baseSalary: number;
  commissions: number;
  totalPayout: number;
  status: 'Paid' | 'Pending' | 'Processing';
  payoutDate?: Date;
  ptCommissionRate?: number;
  rehabCommissionRate?: number;
}

export interface GymSubscriptionStatus {
  planName: string;
  price: number;
  endDate: Date;
  isActive: boolean;
  isTrial: boolean;
  branchUsageCount: number;
  branchLimit: number;
}