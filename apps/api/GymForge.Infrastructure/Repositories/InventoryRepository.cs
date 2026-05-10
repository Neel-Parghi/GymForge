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

        public async Task AddEquipmentAsync(Equipment equipment)
        {
            await _context.Equipment.AddAsync(equipment);
        }

        public async Task DeleteEquipmentAsync(Guid id)
        {
            Equipment? equipment = await _context.Equipment.FindAsync(id);
            if (equipment != null)
            {
                _context.Equipment.Remove(equipment);
            }
        }

        public async Task<Equipment?> GetEquipmentByIdAsync(Guid id)
        {
            return await _context.Equipment
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Equipment>> GetEquipmentByGymIdAsync(Guid gymId)
        {
            return await _context.Equipment
                .AsNoTracking()
                .Where(x => x.GymId == gymId)
                .OrderByDescending(x => x.ModifiedOn ?? x.CreatedOn)
                .ToListAsync();
        }

        public Equipment UpdateEquipment(Equipment equipment)
        {
            if (_context.Entry(equipment).State == EntityState.Detached)
                _context.Equipment.Update(equipment);
            return equipment;
        }

        public async Task AddMaintenanceLogAsync(MaintenanceLog log) => await _context.MaintenanceLogs.AddAsync(log);

        public async Task<MaintenanceLog?> GetMaintenanceLogByIdAsync(Guid id) => 
            await _context.MaintenanceLogs.FindAsync(id);

        public void UpdateMaintenanceLog(MaintenanceLog log)
        {
            if (_context.Entry(log).State == EntityState.Detached)
                _context.MaintenanceLogs.Update(log);
        }

        public async Task<List<MaintenanceLog>> GetMaintenanceLogsByEquipmentIdAsync(Guid equipmentId)
        {
            return await _context.MaintenanceLogs
                .Where(x => x.EquipmentId == equipmentId)
                .OrderByDescending(x => x.StartDate)
                .ToListAsync();
        }

        public async Task<List<MaintenanceLog>> GetAllMaintenanceLogsAsync(Guid gymId)
        {
            return await _context.MaintenanceLogs
                .Include(x => x.Equipment)
                .Where(x => x.Equipment.GymId == gymId)
                .OrderByDescending(x => x.StartDate)
                .ToListAsync();
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
    }
}
