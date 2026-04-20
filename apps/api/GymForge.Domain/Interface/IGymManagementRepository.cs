using GymForge.Contracts.Gym;
using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IGymManagementRepository
    {
        Task AddAddressAsync(Address address);
        Task AddGymAsync(Gym gym);
        Task AddBranchAsync(Branch branch);
        Task AddGymSubscriptionAsync(GymSubscription subscription);
       
        Task<List<GymOwnersDto>> GetGymOwnersList();
        Task<User?> GetGymOwnerByIdAsync(Guid id);
        User UpdateGymOwner(User gymOwner);
        
        Task<List<GymListResponseDto>> GetGymListAsync();
        Task<Gym?> GetGymByIdAsync(Guid id);
        Gym UpdateGym(Gym gym);
        Task DeleteGymAsync(Guid gymId);
    }
}
