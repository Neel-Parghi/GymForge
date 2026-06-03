using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IWorkoutPlanRepository
    {
        Task<IEnumerable<WorkoutPlan>> GetPlansByGymIdAsync(Guid gymId, string? type = null);
        
        Task<WorkoutPlan?> GetPlanByIdAsync(Guid id);
        
        Task<WorkoutPlan> CreatePlanAsync(WorkoutPlan plan);
        
        Task<bool> UpdatePlanAsync(WorkoutPlan plan);
        
        Task<bool> DeletePlanAsync(Guid id);
    }
}
