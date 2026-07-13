export interface SaaSConfigurationDto {
  id: string;
  platformName: string;
  billingEmail: string;
  taxPercentage: number;
  gracePeriodDays: number;
  currency: string;
  billingAddress?: string;
  gstNo?: string;
  supportPhone?: string;
  supportEmail?: string;
  isMaintenanceMode: boolean;
  termsUrl?: string;
  privacyUrl?: string;
  maintenanceStartTime?: Date;
  maintenanceEndTime?: Date;
  yearlyRevenueTarget: number;
  subscriptionTarget: number;
  uptimeThreshold: number;
}
