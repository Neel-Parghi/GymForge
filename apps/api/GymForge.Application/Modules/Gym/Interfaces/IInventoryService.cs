using GymForge.Contracts.Gym.Inventory;
using GymForge.Contracts.Common;
using GymForge.Shared.Models;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IInventoryService
    {
        // Inventory
        Task<PagedResponse<InventoryItemDto>> GetProductsAsync(Guid gymId, PaginationParams pagination, Guid? branchId = null);
        Task<InventoryItemDto> AddProductAsync(CreateProductDto dto, Guid gymId);
        Task<InventoryItemDto?> UpdateProductAsync(Guid id, CreateProductDto dto);
        Task<bool> DeleteProductAsync(Guid id);

        // Sales
        Task<bool> RecordSaleAsync(RecordSaleDto dto, Guid gymId);
        Task<PagedResponse<SaleTransactionDto>> GetSalesHistoryAsync(Guid gymId, PaginationParams pagination, Guid? branchId = null);
        Task<bool> SendSaleReceiptAsync(Guid saleId);

        // Aggregated Stats
        Task<InventoryStatsDto> GetInventoryStatsAsync(Guid gymId, Guid? branchId = null);
    }
}
