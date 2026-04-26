using GymForge.Contracts.Gym.Management;
using GymForge.Contracts.Gym.Owners;
using GymForge.Contracts.Gym.Onboarding;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IGymManagementService
    {
        Task OnboardGymAsync(Guid ownerId, GymOnboardingDto gymOnboardingDto);

        Task<List<GymOwnersDto>> GetGymOwnersList();
        Task<GymOwnersDto> UpdateGymOwner(UpdateGymOwnerDto updateGymOwnerDto);

        Task<List<GymListResponseDto>> GetGymListAsync();
        Task UpdateGymAsync(UpdateGymDto updateGymDto);
        Task DeleteGymAsync(Guid gymId);
    }
}
