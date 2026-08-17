export interface MemberInvoiceDto {
    id: string;
    memberId: string;
    memberName: string;
    email: string;
    billingType: string;
    description: string;
    amount: number;
    amountPaid: number;
    balance: number;
    dateIssued: string;
    dueDate: string;
    status: string;
    paymentMethod: string;
    membershipNumber?: string;
    realRecordId?: string;
    branchId?: string;
    branchName?: string;
    branchLine1?: string;
    branchLine2?: string;
    branchCity?: string;
    branchState?: string;
    branchPostalCode?: string;
}

export interface MemberBillingStatsDto {
    totalCollected: number;
    pendingReceivables: number;
    overdueBalances: number;
    totalInvoiced: number;
}

export interface MemberBillingOverviewDto {
    stats: MemberBillingStatsDto;
    invoices: MemberInvoiceDto[];
    gymName?: string;
    gymBrandName?: string;
    gymGstNumber?: string;
}

export interface CreateCustomInvoiceRequest {
    memberId: string;
    trainerId?: string | null;
    billingType: string;
    amount: number;
    status: string;
    paymentMethod: string;
}

export interface RecordPaymentRequest {
    amount: number;
    paymentMethod: string;
    notes?: string | null;
}

export interface PaymentRecordDto {
    id: string;
    amount: number;
    paymentMethod: string;
    notes?: string | null;
    paidAt: string;
}

export interface StaffPayoutDto {
    staffId: string;
    id: string;
    staffName: string;
    role: string;
    email: string;
    initials: string;
    baseSalary: number;
    commissions: number;
    totalPayout: number;
    status: 'Pending' | 'Paid' | 'Processing';
    ptCommissionRate: number;
    rehabCommissionRate: number;
    payoutDate?: string;
}

export interface StaffPayrollOverviewDto {
    totalBaseSalary: number;
    totalCommissions: number;
    totalPayout: number;
    staffCount: number;
    payouts: StaffPayoutDto[];
}

export interface UpdateStaffPayrollRuleRequest {
    staffId: string;
    baseSalary: number;
    ptCommissionRate: number;
    rehabCommissionRate: number;
}

export interface ReleaseStaffPayoutRequest {
    staffId: string;
    monthKey: string;
    status: 'Pending' | 'Paid' | 'Processing';
    commissions: number;
    totalPayout: number;
}