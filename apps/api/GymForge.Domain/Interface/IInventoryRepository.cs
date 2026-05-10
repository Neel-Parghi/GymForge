using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IInventoryRepository
    {
        // Inventory Items
        Task<InventoryItem?> GetProductByIdAsync(Guid id);
        Task<List<InventoryItem>> GetProductsByGymIdAsync(Guid gymId);
        Task AddProductAsync(InventoryItem item);
        InventoryItem UpdateProduct(InventoryItem item);
        Task DeleteProductAsync(Guid id);

        // Equipment
        Task<Equipment?> GetEquipmentByIdAsync(Guid id);
        Task<List<Equipment>> GetEquipmentByGymIdAsync(Guid gymId);
        Task AddEquipmentAsync(Equipment equipment);
        Equipment UpdateEquipment(Equipment equipment);
        Task DeleteEquipmentAsync(Guid id);

        // Maintenance
        Task AddMaintenanceLogAsync(MaintenanceLog log);
        Task<MaintenanceLog?> GetMaintenanceLogByIdAsync(Guid id);
        void UpdateMaintenanceLog(MaintenanceLog log);
        Task<List<MaintenanceLog>> GetMaintenanceLogsByEquipmentIdAsync(Guid equipmentId);
        Task<List<MaintenanceLog>> GetAllMaintenanceLogsAsync(Guid gymId);

        // Sales & Stock
        Task<bool> RecordSaleAsync(SaleTransaction transaction);
        Task<List<SaleTransaction>> GetSalesByGymIdAsync(Guid gymId);
    }
}
