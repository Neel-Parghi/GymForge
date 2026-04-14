using GymForge.Contracts.Gym;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using GymForge.Shared.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

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

        public async Task<List<GymOwnersDto>> GetGymOwnersList()
        {
            return await _dbContext.Users
                .Where(x => x.Role == UserRole.GymOwner)
                .Select(u => new GymOwnersDto
                {
                    Id = u.Id,
                    Name = u.FirstName + " " + u.LastName,
                    Email = u.Email,
                    Phone = u.Phone,
                    GymsOwned = u.Gyms != null ? u.Gyms.Count : 0,
                    JoinedDate = u.CreatedOn,
                    Status = u.IsActive ? "Active" : "Inactive",
                    InvitationStatus = u.IsInvitationAccepted ? "Accepted" : 
                                       (u.InvitationExpiry > DateTime.UtcNow ? "Pending" : "Expired")
                })
                .ToListAsync();
        }
    }
}
