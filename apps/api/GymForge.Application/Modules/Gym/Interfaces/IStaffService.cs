using GymForge.Contracts.Staff;
using GymForge.Shared.Models;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IStaffService
    {
        Task<StaffResponse> AddStaffAsync(Guid gymId, AddStaffRequest request);
        Task<IEnumerable<StaffResponse>> GetGymStaffAsync(Guid gymId);
        Task<StaffResponse?> GetStaffByIdAsync(Guid id);
        Task UpdateStaffAsync(Guid id, AddStaffRequest request);
        Task DeleteStaffAsync(Guid id);
        
        // PT Assignments
        Task AssignTrainerToMemberAsync(Guid trainerId, Guid memberId, string? slot = null);
        Task<IEnumerable<TrainerMemberResponse>> GetAssignedMembersAsync(Guid trainerId);
        
        // Measurements
        Task RecordMeasurementAsync(Guid memberId, Guid recordedById, AddMeasurementRequest request);
        Task<IEnumerable<MeasurementResponse>> GetMemberMeasurementsAsync(Guid memberId);
    }
}
