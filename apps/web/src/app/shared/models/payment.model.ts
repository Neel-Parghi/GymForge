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
    supportPhone?: string;
}