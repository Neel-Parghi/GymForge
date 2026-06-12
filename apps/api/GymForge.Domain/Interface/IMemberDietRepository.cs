using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IMemberDietRepository
    {
        Task<MemberDietAssignment?> GetActiveDietAssignmentAsync(Guid memberId);
        
        Task AddDietAssignmentAsync(MemberDietAssignment assignment);
        
        Task<IEnumerable<MemberDietAssignment>> GetDietAssignmentsAsync(Guid memberId);
    }
}
