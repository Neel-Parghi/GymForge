using GymForge.Contracts.Gym;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Infrastructure.Persistence.Repositories
{
    public class GymManagementRepository : IGymManagementRepository
    {
        private readonly AppDbContext _dbContext;

        // 1. Inject the AppDbContext through the constructor
        public GymManagementRepository(AppDbContext dbContext) 
        {
            _dbContext = dbContext;
        }

        public async Task GymOnboarding(GymOnboardingDto gymOnboardingDto)
        {
            // 2. Map the DTO to your Domain Entities
            var newGym = new Gym
            {
                // Map properties here:
                // Name = gymOnboardingDto.Name,
                // BrandName = gymOnboardingDto.BrandName,
                // etc.
            };

            // 3. Add the entity to the DbContext
            await _dbContext.Gyms.AddAsync(newGym);
            
            // 4. Save changes to the database
            await _dbContext.SaveChangesAsync();
        }
    }
}
