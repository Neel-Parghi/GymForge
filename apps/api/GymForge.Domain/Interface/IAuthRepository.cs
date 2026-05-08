using GymForge.Contracts.Auth;
using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IAuthRepository
    {
        Task RegisterSuperAdmin(User user);
        
        Task AddUserAsync(User user);

        Task<User?> GetByTokenAsync(string token);
        
        Task<User?> GetUserByIdAsync(Guid userId);
        
        Task<User?> GetByRefreshTokenAsync(string refreshToken);
        
        Task<User?> GetByUserByEmailAsync(string email);
        
        Task<User?> Login(LoginRequestDto user);
    }
}
