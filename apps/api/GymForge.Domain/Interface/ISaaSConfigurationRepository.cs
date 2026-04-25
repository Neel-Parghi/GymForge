using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface ISaaSConfigurationRepository
    {
        Task<SaaSConfiguration> GetConfigurationAsync();
        Task UpdateConfigurationAsync(SaaSConfiguration configuration);
    }
}
