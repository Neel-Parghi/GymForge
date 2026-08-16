using GymForge.Contracts.PlanGeneration;

namespace GymForge.Application.Modules.PlanGeneration.Interface
{
    public interface IPlanGenerationService
    {
        Task<StarterPlanResultDto> GenerateStarterPlansAsync(Guid userId, string primaryGoal, string? experienceLevel, decimal heightCm, decimal weightKg, DateTime dob, string gender);
    }
}
