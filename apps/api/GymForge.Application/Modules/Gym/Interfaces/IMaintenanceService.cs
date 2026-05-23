using GymForge.Contracts.Gym.Inventory;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IMaintenanceService
    {
        Task<bool> LogMaintenanceAsync(LogMaintenanceDto dto);
        Task<List<MaintenanceLogDto>> GetMaintenanceHistoryAsync(Guid equipmentId);
        Task<List<MaintenanceLogDto>> GetAllMaintenanceLogsAsync(Guid gymId, Guid? branchId = null);
    }
}
