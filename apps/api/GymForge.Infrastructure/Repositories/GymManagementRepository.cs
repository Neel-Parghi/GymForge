using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;

namespace GymForge.Infrastructure.Repositories
{
    public class GymManagementRepository : IGymManagementRepository
    {
        private readonly AppDbContext _dbContext;

        public GymManagementRepository(AppDbContext dbContext) 
        {
            _dbContext = dbContext;
        }

        public async Task AddAddressAsync(Address address)
        {
            await _dbContext.Addresses.AddAsync(address);
        }

        public async Task AddGymAsync(Gym gym)
        {
            await _dbContext.Gyms.AddAsync(gym);
        }

        public async Task AddBranchAsync(Branch branch)
        {
            await _dbContext.Branches.AddAsync(branch);
        }

        public async Task AddGymSubscriptionAsync(GymSubscription subscription)
        {
            await _dbContext.GymSubscriptions.AddAsync(subscription);
        }
    }
}
