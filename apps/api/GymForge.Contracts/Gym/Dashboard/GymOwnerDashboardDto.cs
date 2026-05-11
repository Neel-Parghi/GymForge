namespace GymForge.Contracts.Gym.Dashboard
{
    public class GymOwnerDashboardDto
    {
        public int TotalMembers { get; set; }
        public double MemberGrowthPercentage { get; set; }
        public int ActiveMembers { get; set; }
        public int FrozenMembers { get; set; }
        public int NewMembersThisMonth { get; set; }
        public int TodayAttendance { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public decimal MembershipRevenue { get; set; }
        public decimal ProductSalesRevenue { get; set; }
        public int PendingInvoices { get; set; }
        public int LowStockItems { get; set; }
        public int ActiveTrainers { get; set; }
        public int SupportStaffCount { get; set; }
        public int MaintenanceDueCount { get; set; }

        public List<RecentEnrollmentDto> RecentEnrollments { get; set; } = new();
        public List<UpcomingRenewalDto> UpcomingRenewals { get; set; } = new();
    }

    public class RecentEnrollmentDto
    {
        public string MemberName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public DateTime EnrollmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Initials { get; set; } = string.Empty;
    }

    public class UpcomingRenewalDto
    {
        public string MemberName { get; set; } = string.Empty;
        public int DaysRemaining { get; set; }
        public DateTime EndDate { get; set; }
    }
}
