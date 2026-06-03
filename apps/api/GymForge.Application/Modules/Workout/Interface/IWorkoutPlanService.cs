using GymForge.Contracts.WorkoutPlan;

namespace GymForge.Application.Modules.Workout.Interface
{
    public interface IWorkoutPlanService
    {
        Task<IEnumerable<WorkoutPlanDto>> GetPlansByGymIdAsync(Guid gymId, string? type = null);
        
        Task<WorkoutPlanDto?> GetPlanByIdAsync(Guid id);
        
        Task<WorkoutPlanDto> CreatePlanAsync(CreateWorkoutPlanRequest request, Guid gymId, Guid createdById);
        
        Task<WorkoutPlanDto> UpdatePlanAsync(UpdateWorkoutPlanRequest request, Guid gymId, Guid modifiedById);
        
        Task<bool> DeletePlanAsync(Guid id);
    }
}
