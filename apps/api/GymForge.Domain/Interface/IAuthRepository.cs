using GymForge.Contracts.Auth;
using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IAuthRepository
    {
        Task RegisterSuperAdmin(User user);
        Task AddUserAsync(User user);

        Task<User?> Login(LoginRequestDto user);
    }
}
