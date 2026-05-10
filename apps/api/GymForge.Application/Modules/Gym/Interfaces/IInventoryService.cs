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

        // Sales
        Task<bool> RecordSaleAsync(RecordSaleDto dto, Guid gymId);
        Task<List<SaleTransactionDto>> GetSalesHistoryAsync(Guid gymId);

        // Aggregated Stats
        Task<InventoryStatsDto> GetInventoryStatsAsync(Guid gymId);
    }
}
