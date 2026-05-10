using Microsoft.EntityFrameworkCore;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;

namespace GymForge.Infrastructure.Repositories
{
    public class EquipmentRepository : IEquipmentRepository
    {
        private readonly AppDbContext _dbContext;

        public EquipmentRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Equipment?> GetEquipmentByIdAsync(Guid id)
        {
            return await _dbContext.Equipment
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Equipment>> GetEquipmentByGymIdAsync(Guid gymId)
        {
            return await _dbContext.Equipment
                .AsNoTracking()
                .Where(x => x.GymId == gymId)
                .OrderByDescending(x => x.ModifiedOn ?? x.CreatedOn)
                .ToListAsync();
        }

        public async Task AddEquipmentAsync(Equipment equipment)
        {
            await _dbContext.Equipment.AddAsync(equipment);
        }

        public Equipment UpdateEquipment(Equipment equipment)
        {
            if (_dbContext.Entry(equipment).State == EntityState.Detached)
                _dbContext.Equipment.Update(equipment);
            return equipment;
        }

        public async Task DeleteEquipmentAsync(Guid id)
        {
            Equipment? equipment = await _dbContext.Equipment.FindAsync(id);
            if (equipment != null)
            {
                _dbContext.Equipment.Remove(equipment);
            }
        }
    }
}
