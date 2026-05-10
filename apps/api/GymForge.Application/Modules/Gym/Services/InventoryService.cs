using AutoMapper;
using GymForge.Application.DTOs.Inventory;
using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Gym.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IEquipmentRepository _equipmentRepository;
        private readonly IMaintenanceRepository _maintenanceRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public InventoryService(
            IInventoryRepository inventoryRepository, 
            IEquipmentRepository equipmentRepository,
            IMaintenanceRepository maintenanceRepository,
            IMapper mapper, 
            IUnitOfWork unitOfWork)
        {
            _inventoryRepository = inventoryRepository;
            _equipmentRepository = equipmentRepository;
            _maintenanceRepository = maintenanceRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<InventoryItemDto>> GetProductsAsync(Guid gymId)
        {
            List<InventoryItem> products = await _inventoryRepository.GetProductsByGymIdAsync(gymId);
            return _mapper.Map<List<InventoryItemDto>>(products);
        }

        public async Task<InventoryItemDto> AddProductAsync(CreateProductDto dto, Guid gymId)
        {
            InventoryItem item = _mapper.Map<InventoryItem>(dto);
            item.GymId = gymId;
            item.CreatedOn = DateTime.UtcNow;

            await _inventoryRepository.AddProductAsync(item);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<InventoryItemDto>(item);
        }

        public async Task<InventoryItemDto?> UpdateProductAsync(Guid id, CreateProductDto dto)
        {
            InventoryItem? item = await _inventoryRepository.GetProductByIdAsync(id);
            if (item == null) return null;

            _mapper.Map(dto, item);
            item.ModifiedOn = DateTime.UtcNow;

            _inventoryRepository.UpdateProduct(item);
            await _unitOfWork.SaveChangesAsync();
            
            return _mapper.Map<InventoryItemDto>(item);
        }

        public async Task<bool> DeleteProductAsync(Guid id)
        {
            await _inventoryRepository.DeleteProductAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RecordSaleAsync(RecordSaleDto dto, Guid gymId)
        {
            InventoryItem? product = await _inventoryRepository.GetProductByIdAsync(dto.ProductId);
            if (product == null) return false;

            SaleTransaction transaction = new()
            {
                Id = Guid.NewGuid(),
                MemberId = dto.MemberId,
                InventoryItemId = dto.ProductId,
                Quantity = dto.Quantity,
                UnitPrice = product.SellingPrice,
                TotalAmount = product.SellingPrice * dto.Quantity,
                PaymentMethod = dto.PaymentMethod,
                TransactionDate = DateTime.UtcNow,
                GymId = gymId,
                CreatedOn = DateTime.UtcNow
            };

            bool success = await _inventoryRepository.RecordSaleAsync(transaction);
            if (success)
            {
                await _unitOfWork.SaveChangesAsync();
            }

            return success;
        }

        public async Task<List<SaleTransactionDto>> GetSalesHistoryAsync(Guid gymId)
        {
            List<SaleTransaction> sales = await _inventoryRepository.GetSalesByGymIdAsync(gymId);
            return _mapper.Map<List<SaleTransactionDto>>(sales);
        }

        public async Task<InventoryStatsDto> GetInventoryStatsAsync(Guid gymId)
        {
            var products = await _inventoryRepository.GetProductsByGymIdAsync(gymId);
            var equipment = await _equipmentRepository.GetEquipmentByGymIdAsync(gymId);
            var sales = await _inventoryRepository.GetSalesByGymIdAsync(gymId);
            var logs = await _maintenanceRepository.GetAllMaintenanceLogsAsync(gymId);
            var today = DateTime.UtcNow.Date;

            var todaySales = sales.Where(s => s.TransactionDate.Date == today).ToList();
            var recentSales = sales.Take(5).ToList();

            var categoryStats = products
                .GroupBy(p => p.Category)
                .Select(g => new CategoryStatDto
                {
                    Category = g.Key,
                    Count = g.Count(),
                    Value = g.Sum(p => p.SellingPrice * p.StockQuantity)
                })
                .ToList();

            var topProducts = sales
                .GroupBy(s => s.InventoryItemId)
                .Select(g => {
                    var prod = products.FirstOrDefault(p => p.Id == g.Key);
                    return new TopProductDto
                    {
                        Name = prod?.Name ?? "Unknown Product",
                        TotalSold = g.Sum(s => s.Quantity),
                        TotalRevenue = g.Sum(s => s.TotalAmount)
                    };
                })
                .OrderByDescending(x => x.TotalSold)
                .Take(5)
                .ToList();

            var upcomingMaintenance = logs
                .Where(l => l.Status != "Completed" && l.EstimatedEndDate.HasValue && l.EstimatedEndDate.Value >= today)
                .OrderBy(l => l.EstimatedEndDate)
                .Take(5)
                .Select(l => new UpcomingMaintenanceDto
                {
                    EquipmentName = l.Equipment?.Name ?? "Unknown Asset",
                    ScheduledDate = l.EstimatedEndDate.Value,
                    HealthPercentage = l.Equipment?.HealthPercentage ?? 0
                })
                .ToList();

            return new InventoryStatsDto
            {
                TotalProducts = products.Count,
                LowStockCount = products.Count(p => p.StockQuantity <= p.ReorderLevel),
                MaintenanceDueCount = equipment.Count(e => e.HealthPercentage < 70 || e.IsInMaintenance),
                TodaySalesAmount = todaySales.Sum(s => s.TotalAmount),
                TodaySalesCount = todaySales.Count,
                TotalSalesAmount = sales.Sum(s => s.TotalAmount),
                TotalSalesCount = sales.Count,
                CategoryBreakdown = categoryStats,
                RecentSales = _mapper.Map<List<SaleTransactionDto>>(recentSales),
                TopProducts = topProducts,
                UpcomingMaintenance = upcomingMaintenance
            };
        }
    }
}
