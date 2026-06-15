using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IMemberWorkoutRepository
    {
        Task<MemberPlanAssignment?> GetActivePlanAssignmentAsync(Guid memberOrUserId);
        
        Task AddPlanAssignmentAsync(MemberPlanAssignment assignment);
        
        Task<IEnumerable<WorkoutSessionLog>> GetWorkoutLogsAsync(Guid memberOrUserId);
        
        Task AddWorkoutSessionLogAsync(WorkoutSessionLog log);
        
        Task RemoveWorkoutSessionLogsAsync(IEnumerable<WorkoutSessionLog> logs);
        
        Task<IEnumerable<WorkoutSessionLog>> GetLogsByDateAsync(Guid memberOrUserId, DateTime date);

        Task AddOrUpdateScheduleDayAsync(MemberWorkoutScheduleDay scheduleDay);

        Task<IEnumerable<MemberPlanAssignment>> GetPlanAssignmentsAsync(Guid memberOrUserId);
    }
}
