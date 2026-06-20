using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IUserNotificationRepository
    {
        Task<UserNotification?> GetByIdAsync(Guid id);
        Task<List<UserNotification>> GetByUserIdAsync(Guid userId);
        Task AddAsync(UserNotification notification);
        void Update(UserNotification notification);
        Task DeleteAsync(Guid id);
    }
}
