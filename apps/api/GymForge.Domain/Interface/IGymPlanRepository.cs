using GymForge.Contracts.GymPlans;
using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IGymPlanRepository
    {
        Task<IEnumerable<GymPlan>> GetPlansByOwnerIdAsync(Guid ownerId);

        Task<GymPlan?> GetPlanByIdAsync(Guid planId);

        Task<GymPlan> AddGymPlanAsync(GymPlan createGymPlan);

        GymPlan UpdateGymPlan(GymPlan updateGymPlan);

        Task<bool> DeleteGymPlanAsync(Guid planId);
    }
}
