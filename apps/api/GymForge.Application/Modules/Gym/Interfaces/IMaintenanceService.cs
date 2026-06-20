using GymForge.Contracts.Gym.Inventory;
using GymForge.Contracts.Common;
using GymForge.Shared.Models;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IMaintenanceService
    {
        Task<bool> LogMaintenanceAsync(LogMaintenanceDto dto);
        Task<List<MaintenanceLogDto>> GetMaintenanceHistoryAsync(Guid equipmentId);
        Task<PagedResponse<MaintenanceLogDto>> GetAllMaintenanceLogsAsync(Guid gymId, PaginationParams pagination, Guid? branchId = null);
    }
}
