using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class MemberDietRepository : IMemberDietRepository
    {
        private readonly AppDbContext _dbContext;

        public MemberDietRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<MemberDietAssignment?> GetActiveDietAssignmentAsync(Guid memberId)
        {
            return await _dbContext.MemberDietAssignments
                .Include(mda => mda.DietPlan)
                    .ThenInclude(dp => dp.Meals)
                .Where(mda => mda.MemberId == memberId && mda.IsActive)
                .OrderByDescending(mda => mda.AssignedAt)
                .FirstOrDefaultAsync();
        }

        public async Task AddDietAssignmentAsync(MemberDietAssignment assignment)
        {
            await _dbContext.MemberDietAssignments.AddAsync(assignment);
        }

        public async Task<IEnumerable<MemberDietAssignment>> GetDietAssignmentsAsync(Guid memberId)
        {
            return await _dbContext.MemberDietAssignments
                .Include(mda => mda.DietPlan)
                    .ThenInclude(dp => dp.Meals)
                .Where(mda => mda.MemberId == memberId)
                .OrderByDescending(mda => mda.AssignedAt)
                .ToListAsync();
        }
    }
}
