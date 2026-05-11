using GymForge.Contracts.Gym.Dashboard;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IGymOwnerDashboardService
    {
        Task<GymOwnerDashboardDto> GetGymOwnerDashboardStatsAsync(Guid gymId);
    }
}
