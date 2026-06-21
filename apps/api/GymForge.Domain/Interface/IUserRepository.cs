using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IUserRepository
    {
        Task<User?> GetUserByIdAsync(Guid userId);
        
        Task<Guid?> GetBranchIdByUserIdAsync(Guid userId);
        
        Task LinkUserToGymMembersAsync(User user);
        
        Task DeleteUserAsync(User user);
        
        Task<IEnumerable<User>> GetPendingDeletionRequestsAsync();
        
        Task<(IEnumerable<User> Items, int TotalCount)> GetStandaloneUsersAsync(int pageNumber, int pageSize, string? searchTerm);
        
        Task UpdateUserAsync(User user);
    }
}
