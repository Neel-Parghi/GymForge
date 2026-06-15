using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IWorkoutPlanRepository
    {
        Task<IEnumerable<WorkoutPlan>> GetPlansAsync(Guid? gymId, Guid userId, string? type = null);
        
        Task<WorkoutPlan?> GetPlanByIdAsync(Guid id);
        
        Task<WorkoutPlan> CreatePlanAsync(WorkoutPlan plan);
        
        Task<bool> UpdatePlanAsync(WorkoutPlan plan);
        
        Task<bool> DeletePlanAsync(Guid id);
    }
}
