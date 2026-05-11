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

        // Sales & Stock
        Task<bool> RecordSaleAsync(SaleTransaction transaction);
        Task<List<SaleTransaction>> GetSalesByGymIdAsync(Guid gymId);
        Task<SaleTransaction?> GetSaleByIdAsync(Guid id);
    }
}
