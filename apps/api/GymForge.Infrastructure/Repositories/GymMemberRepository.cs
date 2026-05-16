using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class GymMemberRepository : IGymMemberRepository
    {
        private readonly AppDbContext _dbContext;
        public GymMemberRepository(AppDbContext dbContext) 
        {
            _dbContext = dbContext;
        }

        public async Task AddAsync(GymMember member)
        {
            await _dbContext.GymMembers.AddAsync(member);   
        }

        public async Task AddSubscriptionAsync(MemberSubscription subscription)
        {
            await _dbContext.MemberSubscriptions.AddAsync(subscription);
        }

        public Task<bool> ExistsByEmailAsync(string email, Guid gymId)
        {
            return _dbContext.GymMembers.AnyAsync(x => x.Email == email && x.GymId == gymId);
        }

        public async Task<IEnumerable<GymMember>> GetAllByGymIdAsync(Guid gymId)
        {
            return await _dbContext.GymMembers
                                    .AsNoTracking()
                                    .Include(x => x.Subscriptions)
                                    .Include(x => x.Address)
                                    .Where(x => x.GymId == gymId)
                                    .OrderByDescending(x => x.ModifiedOn)
                                    .ToListAsync();
        }

        public async Task<(IEnumerable<GymMember> Items, int TotalCount)> GetPagedMembersAsync(Guid gymId, int pageNumber, int pageSize, string? searchTerm)
        {
            IQueryable<GymMember> query = _dbContext.GymMembers
                                  .AsNoTracking()
                                  .Include(x => x.Subscriptions)
                                  .Include(x => x.Address)
                                  .Where(x => x.GymId == gymId);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(x => x.FirstName.ToLower().Contains(searchTerm) ||
                                       x.LastName.ToLower().Contains(searchTerm) ||
                                       x.Email.ToLower().Contains(searchTerm) ||
                                       x.MembershipNumber.ToLower().Contains(searchTerm));
            }

            int totalCount = await query.CountAsync();
            List<GymMember> items = await query.OrderByDescending(x => x.CreatedOn)
                                   .Skip((pageNumber - 1) * pageSize)
                                   .Take(pageSize)
                                   .ToListAsync();

            return (items, totalCount);
        }

        public async Task<GymMember?> GetByIdAsync(Guid id)
        {
            return await _dbContext.GymMembers
                                    .Include(x => x.Subscriptions)
                                    .Include(x => x.Address)
                                    .FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task UpdateAsync(GymMember member)
        {
            _dbContext.GymMembers.Update(member);
            return Task.CompletedTask;
        }

        public async Task DeactivateActiveSubscriptionsAsync(Guid memberId)
        {
            List<MemberSubscription> active = await _dbContext.MemberSubscriptions
                .Where(s => s.MemberId == memberId && s.IsActive)
                .ToListAsync();

            foreach (var sub in active)
                sub.IsActive = false;
        }

        public async Task DeleteAsync(Guid id)
        {
            GymMember? member = await _dbContext.GymMembers.FindAsync(id);
            if (member != null)
            {
                _dbContext.GymMembers.Remove(member);
            }
        }
    }
}
