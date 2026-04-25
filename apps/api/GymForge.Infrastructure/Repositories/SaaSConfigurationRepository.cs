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
            var config = await _dbContext.SaaSConfigurations.FirstOrDefaultAsync();
            if (config == null)
            {
                throw new Exception("SaaS Configuration not found.");
            }
            return config;
        }

        public async Task UpdateConfigurationAsync(SaaSConfiguration configuration)
        {
            _dbContext.SaaSConfigurations.Update(configuration);
            await Task.CompletedTask;
        }
    }
}
