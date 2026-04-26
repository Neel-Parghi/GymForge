using System.Threading.Tasks;
using GymForge.Contracts.SuperAdmin.Configuration;

namespace GymForge.Application.Modules.SuperAdmin.Interfaces
{
    public interface ISaaSConfigurationService
    {
        Task<SaaSConfigurationDto> GetConfigurationAsync();
        Task UpdateConfigurationAsync(SaaSConfigurationDto configDto);
    }
}
