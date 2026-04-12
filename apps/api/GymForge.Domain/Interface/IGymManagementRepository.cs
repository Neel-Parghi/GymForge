using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IGymManagementRepository
    {
        Task AddAddressAsync(Address address);
        Task AddGymAsync(Gym gym);
        Task AddBranchAsync(Branch branch);
        Task AddGymSubscriptionAsync(GymSubscription subscription);
    }
}
