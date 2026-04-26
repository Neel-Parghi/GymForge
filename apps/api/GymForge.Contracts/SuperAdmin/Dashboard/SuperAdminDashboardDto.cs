using System.Collections.Generic;

namespace GymForge.Contracts.SuperAdmin.Dashboard
{
    public class SuperAdminDashboardDto
    {
        public PlatformHealthDto Health { get; set; }
        public MetricDto TotalRevenue { get; set; }
        public MetricDto Subscriptions { get; set; }
        public MetricDto TotalGyms { get; set; }
        public List<RecentGymRegistrationDto> RecentRegistrations { get; set; }
    }
}
