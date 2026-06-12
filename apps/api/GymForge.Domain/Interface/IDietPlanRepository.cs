using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IDietPlanRepository
    {
        Task<IEnumerable<DietPlan>> GetPlansByGymIdAsync(Guid gymId, string? goal = null);
        
        Task<DietPlan?> GetPlanByIdAsync(Guid id);
        
        Task<DietPlan> CreatePlanAsync(DietPlan plan);
        
        Task<bool> UpdatePlanAsync(DietPlan plan);
        
        Task<bool> DeletePlanAsync(Guid id);
    }
}
