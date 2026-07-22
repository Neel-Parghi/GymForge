export interface GymSettingsDto {
  roleRightsMatrixJson?: string;
  planExpirationTriggerDays: number;
}

export interface GymHolidayDto {
  id: string;
  name: string;
  date: Date;
  branchId?: string;
  branchName?: string;
}
