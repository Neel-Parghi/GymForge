using GymForge.Contracts.Gym.Management;
using GymForge.Contracts.Gym.Owners;
using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IGymManagementRepository
    {
        Task AddAddressAsync(Address address);
        Task AddGymAsync(Gym gym);
        Task AddBranchAsync(Branch branch);
        Task AddGymSubscriptionAsync(SubscriptionRecord subscription);
       
        Task<List<GymOwnersDto>> GetGymOwnersList();
        Task<User?> GetGymOwnerByIdAsync(Guid id);
        User UpdateGymOwner(User gymOwner);
        
        Task<List<GymListResponseDto>> GetGymListAsync();
        Task<Gym?> GetGymByIdAsync(Guid id);
        Gym UpdateGym(Gym gym);
        Task DeleteGymAsync(Guid gymId);
        Task<List<Branch>> GetBranchesByGymIdAsync(Guid gymId);
    }
}
