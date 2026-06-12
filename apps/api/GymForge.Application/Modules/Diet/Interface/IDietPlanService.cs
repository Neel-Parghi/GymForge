using GymForge.Contracts.DietPlan;

namespace GymForge.Application.Modules.Diet.Interface
{
    public interface IDietPlanService
    {
        Task<IEnumerable<DietPlanDto>> GetPlansByGymIdAsync(Guid gymId, string? goal = null);
        
        Task<DietPlanDto?> GetPlanByIdAsync(Guid id);
        
        Task<DietPlanDto> CreatePlanAsync(CreateDietPlanRequest request, Guid gymId, Guid createdById);
        
        Task<DietPlanDto> UpdatePlanAsync(UpdateDietPlanRequest request, Guid gymId, Guid modifiedById);
        
        Task<bool> DeletePlanAsync(Guid id);
    }
}
