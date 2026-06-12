using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class DietPlanRepository : IDietPlanRepository
    {
        private readonly AppDbContext _dbContext;

        public DietPlanRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<DietPlan>> GetPlansByGymIdAsync(Guid gymId, string? goal = null)
        {
            IQueryable<DietPlan> query = _dbContext.DietPlans
                                            .AsNoTracking()
                                            .Include(p => p.Meals.OrderBy(m => m.SortOrder))
                                            .Where(p => p.GymId == gymId && p.IsTemplate && !p.IsDeleted);

            if (!string.IsNullOrWhiteSpace(goal))
            {
                query = query.Where(p => p.Goal == goal);
            }

            return await query.OrderByDescending(p => p.CreatedOn).ToListAsync();
        }

        public async Task<DietPlan?> GetPlanByIdAsync(Guid id)
        {
            return await _dbContext.DietPlans
                .Include(p => p.Meals.OrderBy(m => m.SortOrder))
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<DietPlan> CreatePlanAsync(DietPlan plan)
        {
            await _dbContext.DietPlans.AddAsync(plan);
            return plan;
        }

        public Task<bool> UpdatePlanAsync(DietPlan plan)
        {
            _dbContext.DietPlans.Update(plan);
            return Task.FromResult(true);
        }

        public async Task<bool> DeletePlanAsync(Guid id)
        {
            DietPlan? plan = await _dbContext.DietPlans.FindAsync(id);
            if (plan == null) return false;

            plan.IsDeleted = true;
            plan.DeletedAt = DateTime.UtcNow;

            _dbContext.DietPlans.Update(plan);
            return true;
        }
    }
}
