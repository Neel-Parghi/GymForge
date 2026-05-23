export interface RecentEnrollment {
  memberName: string;
  email: string;
  planName: string;
  enrollmentDate: string;
  status: string;
  initials: string;
}

export interface UpcomingRenewal {
  memberName: string;
  daysRemaining: number;
  endDate: string;
}

export interface HourlyOccupancy {
  hour: string;
  occupancyCount: number;
}

export interface WeeklyOccupancy {
  day: string;
  occupancyCount: number;
}

export interface MembershipDistribution {
  tierName: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GymOwnerStats {
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
  recentEnrollments: RecentEnrollment[];
  upcomingRenewals: UpcomingRenewal[];
  hourlyOccupancy: HourlyOccupancy[];
  weeklyOccupancy: WeeklyOccupancy[];
  membershipDistribution: MembershipDistribution[];
  todayCheckedInInitials: string[];
}
