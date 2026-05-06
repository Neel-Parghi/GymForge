using GymForge.Contracts.Members;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IGymMemberService
    {
        Task<GymMemberResponse> OnboardMemberAsync(Guid gymId, OnboardMemberRequest request, Guid createdBy);
        Task<IEnumerable<GymMemberResponse>> GetGymMembersAsync(Guid gymId);
        Task<GymMemberResponse?> GetMemberByIdAsync(Guid id);
        Task<GymMemberResponse> UpdateMemberAsync(Guid id, OnboardMemberRequest request, Guid updatedBy);
        Task<bool> ToggleMemberStatusAsync(Guid id);
        Task<bool> FreezeMemberAsync(Guid id, Guid updatedBy);
        Task<bool> UnfreezeMemberAsync(Guid id, Guid updatedBy);
        Task<GymMemberResponse> RenewSubscriptionAsync(Guid memberId, RenewSubscriptionRequest request, Guid updatedBy);
    }
}
