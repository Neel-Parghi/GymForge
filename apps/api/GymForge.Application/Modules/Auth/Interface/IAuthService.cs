using GymForge.Contracts.Auth;

namespace GymForge.Application.Modules.Auth.Interface
{
    public interface IAuthService
    {
        Task<TokenResponseDto> RegisterSuperAdmin(RegisterRequestDto dto);
        Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto dto);

        Task<TokenResponseDto> VerifyOtpAsync(VerifyOtpRequestDto dto);
        Task<bool> ResendOtpAsync(ResendOtpRequestDto dto);

        Task<TokenResponseDto> Login(LoginRequestDto dto);

        Task<TokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto);
        Task LogoutAsync(string refreshToken);
    }
}
