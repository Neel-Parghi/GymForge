using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace GymForge.Infrastructure.Persistence
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            string currentDir = Directory.GetCurrentDirectory();
            string basePath = currentDir.EndsWith("GymForge.Api") ? currentDir : Path.Combine(currentDir, "../GymForge.Api");
            
            // Fallback for different project structures
            if (!Directory.Exists(basePath))
            {
                basePath = Path.Combine(currentDir, "GymForge.Api");
            }

            IConfigurationRoot config = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: true)
                .Build();

            DbContextOptionsBuilder<AppDbContext>? optionsBuilder = new();
            var connectionString = config.GetConnectionString("DefaultConnection");
            
            if (string.IsNullOrEmpty(connectionString))
            {
                // Last resort fallback for design-time if config fails
                connectionString = "Host=localhost;Database=dummy;Username=postgres;Password=password";
            }
            
            if (connectionString.Contains("Host=") || connectionString.Contains("port=") || connectionString.Contains("postgres"))
            {
                optionsBuilder.UseNpgsql(connectionString);
            }
            else
            {
                optionsBuilder.UseSqlServer(connectionString);
            }

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}