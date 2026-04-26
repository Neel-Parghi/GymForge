using GymForge.Application.Modules.SuperAdmin.Interfaces;
using GymForge.Contracts.SuperAdmin.Dashboard;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.SuperAdmin.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _dashboardRepository;
        private readonly ISaaSConfigurationRepository _configRepository;

        public DashboardService(IDashboardRepository dashboardRepository, ISaaSConfigurationRepository configRepository)
        {
            _dashboardRepository = dashboardRepository;
            _configRepository = configRepository;
        }

        public async Task<SuperAdminDashboardDto> GetDashboardStatsAsync()
        {
            DateTime now = DateTime.UtcNow;
            DateTime thisMonthStart = new DateTime(now.Year, now.Month, 1);

            // Fetch Raw Data
            decimal totalRevenue = await _dashboardRepository.GetTotalRevenueAsync();
            decimal prevMonthRevenue = await _dashboardRepository.GetTotalRevenueAsync(null, thisMonthStart);
            
            int activeSubs = await _dashboardRepository.GetActiveSubscriptionsCountAsync();
            int prevActiveSubs = await _dashboardRepository.GetActiveSubscriptionsCountAsync(thisMonthStart);

            int totalGyms = await _dashboardRepository.GetTotalGymsCountAsync();
            List<RecentGymRegistrationDto> recentRegistrations = await _dashboardRepository.GetRecentGymRegistrationsAsync(10);

            // Fetch Global Config Targets
            SaaSConfiguration config = await _configRepository.GetConfigurationAsync();
            
            // Calculate Progress Percentages
            int revenueProgress = 0;
            if (config.MonthlyRevenueTarget > 0)
            {
                // Calculating current month revenue specifically for the monthly target progress
                decimal currentMonthRevenue = await _dashboardRepository.GetTotalRevenueAsync(thisMonthStart);
                revenueProgress = (int)Math.Min(100, (currentMonthRevenue / config.MonthlyRevenueTarget) * 100);
            }

            int subscriptionProgress = 0;
            if (config.SubscriptionTarget > 0)
            {
                subscriptionProgress = Math.Min(100, (activeSubs * 100) / config.SubscriptionTarget);
            }

            // Health Status based on Threshold
            // In a real scenario, this would come from a monitoring service
            string healthStatus = "OPTIMAL"; 
            // example: if (currentUptime < config.UptimeThreshold) healthStatus = "DEGRADED";

            return new SuperAdminDashboardDto
            {
                Health = new PlatformHealthDto
                {
                    Status = healthStatus,
                    LastCheck = DateTime.UtcNow.ToString("h:mm tt") + " UTC"
                },
                TotalRevenue = new MetricDto
                {
                    CurrentValue = totalRevenue,
                    PreviousValue = prevMonthRevenue,
                    Progress = revenueProgress
                },
                Subscriptions = new MetricDto
                {
                    CurrentValue = activeSubs,
                    PreviousValue = prevActiveSubs,
                    Progress = subscriptionProgress
                },
                TotalGyms = new MetricDto
                {
                    CurrentValue = totalGyms,
                    PreviousValue = totalGyms - recentRegistrations.Count
                },
                RecentRegistrations = recentRegistrations
            };
        }
    }
}
