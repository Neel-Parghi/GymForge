using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IGymMemberRepository
    {
        Task<GymMember?> GetByIdAsync(Guid id); 
        Task<IEnumerable<GymMember>> GetAllByGymIdAsync(Guid gymId); 
        Task<(IEnumerable<GymMember> Items, int TotalCount)> GetPagedMembersAsync(Guid gymId, int pageNumber, int pageSize, string? searchTerm);
        Task<bool> ExistsByEmailAsync(string email, Guid gymId);
        Task AddAsync(GymMember member); 
        Task AddSubscriptionAsync(MemberSubscription subscription);
        Task UpdateAsync(GymMember member);
        Task DeactivateActiveSubscriptionsAsync(Guid memberId);
        Task DeleteAsync(Guid id);
    }
}
