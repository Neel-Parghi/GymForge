using GymForge.Contracts.WorkoutPlan;

namespace GymForge.Application.Modules.Workout.Interface
{
    public interface IMemberWorkoutService
    {
        Task<WorkoutPlanDto?> GetActivePlanForMemberAsync(Guid memberId);
        
        Task<bool> AssignPlanToMemberAsync(Guid memberId, Guid planId);
        
        Task<IEnumerable<WorkoutSessionLogDto>> GetWorkoutLogsForMemberAsync(Guid memberId);
        
        Task<WorkoutSessionLogDto> LogWorkoutSessionAsync(Guid memberId, LogWorkoutSessionRequest request);

        Task<bool> SaveRecurringOverrideAsync(Guid memberId, string dayOfWeek, Guid? workoutPlanDayId, bool isRestDay);

        Task<IEnumerable<MemberPlanAssignmentDto>> GetPlanAssignmentsForMemberAsync(Guid memberId);
    }
}
