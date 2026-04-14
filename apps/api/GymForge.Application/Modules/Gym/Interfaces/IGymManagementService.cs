using GymForge.Contracts.Gym;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IGymManagementService
    {
        Task OnboardGymAsync(Guid ownerId, GymOnboardingDto gymOnboardingDto);

        Task<List<GymOwnersDto>> GetGymOwnersList();
    }
}
