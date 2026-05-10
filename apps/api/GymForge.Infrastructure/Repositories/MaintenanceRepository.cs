using Microsoft.EntityFrameworkCore;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;

namespace GymForge.Infrastructure.Repositories
{
    public class MaintenanceRepository : IMaintenanceRepository
    {
        private readonly AppDbContext _dbContext;

        public MaintenanceRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task AddMaintenanceLogAsync(MaintenanceLog log) => await _dbContext.MaintenanceLogs.AddAsync(log);

        public async Task<MaintenanceLog?> GetMaintenanceLogByIdAsync(Guid id) => 
            await _dbContext.MaintenanceLogs.FindAsync(id);

        public void UpdateMaintenanceLog(MaintenanceLog log)
        {
            if (_dbContext.Entry(log).State == EntityState.Detached)
                _dbContext.MaintenanceLogs.Update(log);
        }

        public async Task<List<MaintenanceLog>> GetMaintenanceLogsByEquipmentIdAsync(Guid equipmentId)
        {
            return await _dbContext.MaintenanceLogs
                .Where(x => x.EquipmentId == equipmentId)
                .OrderByDescending(x => x.StartDate)
                .ToListAsync();
        }

        public async Task<List<MaintenanceLog>> GetAllMaintenanceLogsAsync(Guid gymId)
        {
            return await _dbContext.MaintenanceLogs
                .Include(x => x.Equipment)
                .Where(x => x.Equipment.GymId == gymId)
                .OrderByDescending(x => x.StartDate)
                .ToListAsync();
        }
    }
}
