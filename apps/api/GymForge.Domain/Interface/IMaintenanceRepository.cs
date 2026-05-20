using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IMaintenanceRepository
    {
        Task AddMaintenanceLogAsync(MaintenanceLog log);
        Task<MaintenanceLog?> GetMaintenanceLogByIdAsync(Guid id);
        void UpdateMaintenanceLog(MaintenanceLog log);
        Task<List<MaintenanceLog>> GetMaintenanceLogsByEquipmentIdAsync(Guid equipmentId);
        Task<List<MaintenanceLog>> GetAllMaintenanceLogsAsync(Guid gymId, Guid? branchId = null);
    }
}
