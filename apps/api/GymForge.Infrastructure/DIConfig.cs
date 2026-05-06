using GymForge.Domain.Interface;
using GymForge.Infrastructure.Persistence;
using GymForge.Infrastructure.Persistence.Interceptos;
using GymForge.Infrastructure.Repositories;
using GymForge.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GymForge.Infrastructure
{
    public static class DIConfig
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddHttpClient();
            services.AddHttpContextAccessor();

            services.AddDbContext<AppDbContext>((sp, options) =>
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

                // If connectionString is empty, fallback to DATABASE_URL if Render injected it
                if (string.IsNullOrEmpty(connectionString))
                {
                    connectionString = databaseUrl;
                }

                // If the connection string is in URI format (like Render provides), parse it
                if (!string.IsNullOrEmpty(connectionString))
                {
                    connectionString = connectionString.Trim('"', '\'', ' ');
                    
                    if (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) || 
                        connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
                    {
                        var uri = new Uri(connectionString);
                        string[] userInfo = uri.UserInfo.Split(':');
                        string? host = uri.Host;
                        int port = uri.IsDefaultPort ? 5432 : uri.Port;
                        string? database = uri.LocalPath.TrimStart('/');
                        string? username = userInfo.Length > 0 ? userInfo[0] : "";
                        string? password = userInfo.Length > 1 ? userInfo[1] : "";

                        connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
                    }
                }
                else if (string.IsNullOrEmpty(connectionString))
                {
                    connectionString = "Host=localhost;Database=dummy;Username=postgres;Password=password";
                }

                AuditableEntityInterceptor? auditableInterceptor = sp.GetService<AuditableEntityInterceptor>();

                if (connectionString.Contains("Host=") || connectionString.Contains("port=") || connectionString.Contains("postgres"))
                {
                    options.UseNpgsql(connectionString,
                        sqlOptions => sqlOptions.EnableRetryOnFailure());
                }
                else
                {
                    options.UseSqlServer(connectionString,
                        sqlOptions => sqlOptions.EnableRetryOnFailure());
                }

                if (auditableInterceptor != null)
                {
                    options.AddInterceptors(auditableInterceptor);
                }
            });

            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<AuditableEntityInterceptor>();
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IGymManagementRepository, GymManagementRepository>();
            services.AddScoped<ISaaSPlanRepository, SaaSPlanRepository>();
            services.AddScoped<ISaaSPaymentRepository, SaaSPaymentRepository>();
            services.AddScoped<ISaaSConfigurationRepository, SaaSConfigurationRepository>();
            services.AddScoped<IDashboardRepository, DashboardRepository>();
            services.AddScoped<IEmailService, Services.BrevoEmailService>();
            services.AddScoped<IGymPlanRepository, GymPlanRepository>();
            services.AddScoped<IGymMemberRepository, GymMemberRepository>();

            string? cloudName = configuration["Cloudinary:CloudName"];
            if (!string.IsNullOrEmpty(cloudName))
            {
                services.AddScoped<IFileStorageService, CloudinaryFileStorageService>();
            }
            else
            {
                services.AddScoped<IFileStorageService, LocalFileStorageService>();
            }

            return services;
        }
    }
}
