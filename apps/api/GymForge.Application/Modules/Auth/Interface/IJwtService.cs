using GymForge.Contracts.Auth;
using GymForge.Domain.Entities;

namespace GymForge.Application.Modules.Auth.Interface
{
    public interface IJwtService
    {
        TokenResponseDto GenerateToken(User user);
        string GenerateRefreshToken();
    }
}
