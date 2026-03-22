using GymForge.Contracts.Auth;

namespace GymForge.Application.Modules.Auth.Interface
{
    public interface IAuthService
    {
        Task<string> RegisterSuperAdmin(RegisterRequestDto dto);

        Task<string> Login(LoginRequestDto dto);
    }
}
