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