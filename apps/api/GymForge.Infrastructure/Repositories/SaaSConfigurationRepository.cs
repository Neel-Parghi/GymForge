using GymForge.Domain.Entities;
using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymForge.Infrastructure.Repositories
{
    public class SaaSConfigurationRepository : ISaaSConfigurationRepository
    {
        private readonly AppDbContext _dbContext;

        public SaaSConfigurationRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<SaaSConfiguration> GetConfigurationAsync()
        {
            SaaSConfiguration? config = await _dbContext.SaaSConfigurations.FirstOrDefaultAsync();
            if (config == null)
            {
                config = new SaaSConfiguration();
                _dbContext.SaaSConfigurations.Add(config);
                await _dbContext.SaveChangesAsync();
            }
            return config;
        }

        public async Task UpdateConfigurationAsync(SaaSConfiguration configuration)
        {
            _dbContext.SaaSConfigurations.Update(configuration);
            await _dbContext.SaveChangesAsync();
        }
    }
}
