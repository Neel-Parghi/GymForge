using GymForge.Contracts.Auth;
using GymForge.Domain.Entities;

namespace GymForge.Application.Modules.Auth.Interface
{
    public interface IAuthRepository
    {
        Task RegisterSuperAdmin(User user);

        Task<User?> Login(LoginRequestDto user);
    }
}
