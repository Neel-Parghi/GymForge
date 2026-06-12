using GymForge.Contracts.DietPlan;

namespace GymForge.Application.Modules.Diet.Interface
{
    public interface IMemberDietService
    {
        Task<MemberDietAssignmentDto?> GetActiveDietForMemberAsync(Guid memberId);
        
        Task<bool> AssignDietToMemberAsync(Guid memberId, Guid dietPlanId);
        
        Task<bool> AssignCustomDietToMemberAsync(Guid memberId, CreateDietPlanRequest request, Guid gymId, Guid createdById);
    }
}
