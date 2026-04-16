using GymForge.Contracts.SaaSPlan;
using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface ISaaSPlanRepository
    {
        Task<List<Plan>> GetAllPlansAsync();
        
        Task<Plan?> GetPlanByIdAsync(Guid id);
        
        Task<Plan> AddPlanAsync(Plan createPlan);
        
        Plan UpdatePlanAsync(Plan updateSaaSPlan);
    
        Task<bool> DeletePlanAsync(Guid id);
    }
}
