using GymForge.Domain.Entities;

namespace GymForge.Application.Modules.Auth.Interface
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
