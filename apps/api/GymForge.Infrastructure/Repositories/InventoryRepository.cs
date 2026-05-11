using Microsoft.EntityFrameworkCore;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;

namespace GymForge.Infrastructure.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly AppDbContext _context;

        public InventoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddProductAsync(InventoryItem item)
        {
            await _context.InventoryItems.AddAsync(item);
        }

        public async Task DeleteProductAsync(Guid id)
        {
            InventoryItem? item = await _context.InventoryItems.FindAsync(id);
            if (item != null)
            {
                _context.InventoryItems.Remove(item);
            }
        }

        public async Task<InventoryItem?> GetProductByIdAsync(Guid id)
        {
            return await _context.InventoryItems
                .AsNoTracking()
                .Include(x => x.Gym)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<InventoryItem>> GetProductsByGymIdAsync(Guid gymId)
        {
            return await _context.InventoryItems
                .TagWith("GetProductsByGymId")
                .AsNoTracking()
                .Where(x => x.GymId == gymId)
                .OrderByDescending(x => x.ModifiedOn ?? x.CreatedOn)
                .ToListAsync();
        }

        public InventoryItem UpdateProduct(InventoryItem item)
        {
            if (_context.Entry(item).State == EntityState.Detached)
                _context.InventoryItems.Update(item);
            return item;
        }

        public async Task<bool> RecordSaleAsync(SaleTransaction transaction)
        {
            InventoryItem? product = await _context.InventoryItems.FindAsync(transaction.InventoryItemId);
            if (product == null || product.StockQuantity < transaction.Quantity)
            {
                return false;
            }

            product.StockQuantity -= transaction.Quantity;
            
            await _context.SaleTransactions.AddAsync(transaction);
            return true;
        }

        public async Task<List<SaleTransaction>> GetSalesByGymIdAsync(Guid gymId)
        {
            return await _context.SaleTransactions
                .AsNoTracking()
                .Include(x => x.InventoryItem)
                .Include(x => x.Member)
                .Where(x => x.GymId == gymId)
                .OrderByDescending(x => x.TransactionDate)
                .ToListAsync();
        }

        public async Task<SaleTransaction?> GetSaleByIdAsync(Guid id)
        {
            return await _context.SaleTransactions
                .Include(x => x.InventoryItem)
                .Include(x => x.Member)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
