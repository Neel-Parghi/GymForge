using GymForge.Contracts.Gym;

namespace GymForge.Domain.Interface
{
    public interface IGymManagementRepository
    {
        Task GymOnboarding(GymOnboardingDto gymOnboardingDto);
    }
}
