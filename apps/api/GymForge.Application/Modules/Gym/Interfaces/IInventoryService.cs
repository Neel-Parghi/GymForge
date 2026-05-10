using GymForge.Application.DTOs.Inventory;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IInventoryService
    {
        // Inventory
        Task<List<InventoryItemDto>> GetProductsAsync(Guid gymId);
        Task<InventoryItemDto> AddProductAsync(CreateProductDto dto, Guid gymId);
        Task<InventoryItemDto?> UpdateProductAsync(Guid id, CreateProductDto dto);
        Task<bool> DeleteProductAsync(Guid id);

        // Equipment
        Task<List<EquipmentDto>> GetEquipmentAsync(Guid gymId);
        Task<EquipmentDto> AddEquipmentAsync(CreateEquipmentDto dto, Guid gymId);
        Task<bool> UpdateEquipmentAsync(Guid id, CreateEquipmentDto dto);

        // Sales
        Task<bool> RecordSaleAsync(RecordSaleDto dto, Guid gymId);
        Task<List<SaleTransactionDto>> GetSalesHistoryAsync(Guid gymId);

        // Maintenance
        Task<bool> LogMaintenanceAsync(LogMaintenanceDto dto);
        Task<List<MaintenanceLogDto>> GetMaintenanceHistoryAsync(Guid equipmentId);
        Task<List<MaintenanceLogDto>> GetAllMaintenanceLogsAsync(Guid gymId);
        Task<InventoryStatsDto> GetInventoryStatsAsync(Guid gymId);
    }
}
