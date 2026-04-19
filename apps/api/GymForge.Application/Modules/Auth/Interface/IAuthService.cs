using GymForge.Contracts.Auth;

namespace GymForge.Application.Modules.Auth.Interface
{
    public interface IAuthService
    {
        Task<TokenResponseDto> RegisterSuperAdmin(RegisterRequestDto dto);

        Task<TokenResponseDto> Login(LoginRequestDto dto);

        Task<TokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto);
        Task LogoutAsync(string refreshToken);
    }
}
