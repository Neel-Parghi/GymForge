using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IMemberDietRepository
    {
        Task<MemberDietAssignment?> GetActiveDietAssignmentAsync(Guid memberOrUserId);
        
        Task AddDietAssignmentAsync(MemberDietAssignment assignment);
        
        Task<IEnumerable<MemberDietAssignment>> GetDietAssignmentsAsync(Guid memberOrUserId);
    }
}
