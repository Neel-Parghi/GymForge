using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class GymPlanRepository : IGymPlanRepository
    {
        private readonly AppDbContext _dbContext;
        public GymPlanRepository(AppDbContext dbContext) 
        {
            _dbContext = dbContext;
        }

        public async Task<GymPlan> AddGymPlanAsync(GymPlan createGymPlan)
        {
            await _dbContext.GymPlans.AddAsync(createGymPlan);
            return createGymPlan;
        }

        public async Task<GymPlan?> GetPlanByIdAsync(Guid planId)
        {
            return await _dbContext.GymPlans.FirstOrDefaultAsync(x => x.Id == planId);
        }

        public async Task<IEnumerable<GymPlan>> GetPlansByOwnerIdAsync(Guid ownerId)
        {
            return await _dbContext.GymPlans.Where(x => x.GymOwnerId == ownerId).ToListAsync();
        }

        public GymPlan UpdateGymPlan(GymPlan updateGymPlan)
        {
            _dbContext.GymPlans.Update(updateGymPlan);
            return updateGymPlan;
        }

        public async Task<bool> DeleteGymPlanAsync(Guid planId)
        {
            var plan = await _dbContext.GymPlans.FindAsync(planId);
            if (plan == null) return false;

            _dbContext.GymPlans.Remove(plan);
            return true;
        }
    }
}
