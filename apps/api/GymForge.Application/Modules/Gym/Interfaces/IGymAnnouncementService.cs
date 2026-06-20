using GymForge.Contracts.Announcements;

namespace GymForge.Application.Modules.Gym.Interfaces
{
    public interface IGymAnnouncementService
    {
        Task<GymAnnouncementResponse> CreateAnnouncementAsync(Guid gymId, Guid? branchId, GymAnnouncementRequest request);
        Task<IEnumerable<GymAnnouncementResponse>> GetAllAnnouncementsAsync(Guid gymId);
        Task<IEnumerable<GymAnnouncementResponse>> GetActiveAnnouncementsAsync(Guid gymId);
        Task<GymAnnouncementResponse?> UpdateAnnouncementAsync(Guid id, Guid gymId, GymAnnouncementRequest request);
        Task<bool> DeleteAnnouncementAsync(Guid id, Guid gymId);
    }
}
