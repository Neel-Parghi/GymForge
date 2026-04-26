using GymForge.Contracts.SuperAdmin.Dashboard;

namespace GymForge.Application.Modules.SuperAdmin.Interfaces
{
    public interface IDashboardService
    {
        Task<SuperAdminDashboardDto> GetDashboardStatsAsync();
    }
}
