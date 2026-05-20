using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IStaffRepository
    {
        Task AddAsync(Staff staff);
        Task<Staff?> GetByIdAsync(Guid id);
        Task<IEnumerable<Staff>> GetAllByGymIdAsync(Guid gymId, Guid? branchId = null);
        Task<(IEnumerable<Staff> Items, int TotalCount)> GetPagedStaffAsync(Guid gymId, int pageNumber, int pageSize, string? searchTerm, Guid? branchId = null);
        Task UpdateAsync(Staff staff);
        Task DeleteAsync(Guid id);
        Task<bool> ExistsByEmailAsync(string email, Guid gymId);
        
        // PT Assignments
        Task AddPTAssignmentAsync(PTAssignment assignment);
        Task<IEnumerable<PTAssignment>> GetAssignmentsByTrainerIdAsync(Guid trainerId);
        Task<IEnumerable<PTAssignment>> GetAssignmentsByMemberIdAsync(Guid memberId);
        
        // Measurements
        Task AddMeasurementAsync(MemberMeasurement measurement);
        Task<IEnumerable<MemberMeasurement>> GetMeasurementsByMemberIdAsync(Guid memberId);
    }
}
