using GymForge.Contracts.Gym;

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
