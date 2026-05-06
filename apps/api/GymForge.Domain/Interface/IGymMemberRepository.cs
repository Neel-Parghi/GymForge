using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IGymMemberRepository
    {
        Task<GymMember?> GetByIdAsync(Guid id); 
        Task<IEnumerable<GymMember>> GetAllByGymIdAsync(Guid gymId); 
        Task<bool> ExistsByEmailAsync(string email, Guid gymId);
        Task AddAsync(GymMember member); 
        Task AddSubscriptionAsync(MemberSubscription subscription);
        Task UpdateAsync(GymMember member);
        Task DeactivateActiveSubscriptionsAsync(Guid memberId);
    }
}
