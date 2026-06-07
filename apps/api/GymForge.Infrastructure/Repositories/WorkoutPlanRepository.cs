using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class WorkoutPlanRepository : IWorkoutPlanRepository
    {
        private readonly AppDbContext _dbContext;

        public WorkoutPlanRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<WorkoutPlan>> GetPlansByGymIdAsync(Guid gymId, string? type = null)
        {
            IQueryable<WorkoutPlan> query = _dbContext.WorkoutPlans
                                            .AsNoTracking()
                                            .Include(p => p.Days.OrderBy(d => d.DayIndex))
                                                .ThenInclude(d => d.Exercises.OrderBy(e => e.SortOrder))
                                            .Where(p => p.GymId == gymId);

            if (!string.IsNullOrWhiteSpace(type))
            {
                query = query.Where(p => p.Type == type);
            }

            return await query.OrderByDescending(p => p.CreatedOn).ToListAsync();
        }

        public async Task<WorkoutPlan?> GetPlanByIdAsync(Guid id)
        {
            return await _dbContext.WorkoutPlans
                .Include(p => p.Days.OrderBy(d => d.DayIndex))
                    .ThenInclude(d => d.Exercises.OrderBy(e => e.SortOrder))
                .FirstOrDefaultAsync(p => p.Id == id);
        }   

        public async Task<WorkoutPlan> CreatePlanAsync(WorkoutPlan plan)
        {
            await _dbContext.WorkoutPlans.AddAsync(plan);
            return plan;
        }

        public Task<bool> UpdatePlanAsync(WorkoutPlan plan)
        {
            _dbContext.WorkoutPlans.Update(plan);
            return Task.FromResult(true);
        }

        public async Task<bool> DeletePlanAsync(Guid id)
        {
            WorkoutPlan? plan = await _dbContext.WorkoutPlans.FindAsync(id);
            if (plan == null) return false;

            plan.IsDeleted = true;
            plan.DeletedAt = DateTime.UtcNow;

            _dbContext.WorkoutPlans.Update(plan);
            return true;
        }
    }
}
