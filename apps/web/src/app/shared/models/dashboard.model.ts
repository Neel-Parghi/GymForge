// Super Admin Dashboard Models
export interface MetricDto {
  currentValue: number;
  previousValue?: number;
  progress?: number;
}

export interface PlanDistributionDto {
  planName: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PlatformHealthDto {
  pendingVerifications: number;
  status?: string;
  lastCheck?: string;
}

export interface RecentGymRegistrationDto {
  id: string;
  gymName: string;
  ownerName: string;
  dateJoined: Date;
  tier: string;
  status: string;
  initials: string;
}

export interface SuperAdminDashboardDto {
  health?: PlatformHealthDto;
  totalRevenue?: MetricDto;
  monthlyRecurringRevenue?: MetricDto;
  annualRecurringRevenue?: MetricDto;
  subscriptions?: MetricDto;
  totalGyms?: MetricDto;
  planDistribution?: PlanDistributionDto[];
  recentRegistrations?: RecentGymRegistrationDto[];
}

// Gym Owner Dashboard Models
export interface HourlyOccupancyDto {
  hour: string;
  occupancyCount: number;
}

export interface MembershipDistributionDto {
  tierName: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RecentEnrollmentDto {
  memberName: string;
  email: string;
  planName: string;
  enrollmentDate: Date;
  status: string;
  initials: string;
}

export interface UpcomingRenewalDto {
  memberName: string;
  daysRemaining: number;
  endDate: Date;
}

export interface WeeklyOccupancyDto {
  day: string;
  occupancyCount: number;
}

export interface GymOwnerDashboardDto {
  totalMembers: number;
  memberGrowthPercentage: number;
  activeMembers: number;
  frozenMembers: number;
  todayAttendance: number;
  monthlyRevenue: number;
  membershipRevenue: number;
  productSalesRevenue: number;
  lowStockItems: number;
  totalProductsCount: number;
  branchesCount: number;
  activeTrainers: number;
  supportStaffCount: number;
  revenueTrendPercentage: number;

  recentEnrollments: RecentEnrollmentDto[];
  upcomingRenewals: UpcomingRenewalDto[];
  hourlyOccupancy: HourlyOccupancyDto[];
  weeklyOccupancy: WeeklyOccupancyDto[];
  membershipDistribution: MembershipDistributionDto[];
  todayCheckedInInitials: string[];
}
